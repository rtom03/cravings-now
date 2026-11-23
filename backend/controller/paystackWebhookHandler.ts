// controller/paystackWebhook.ts
import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import { orderEvents } from "../lib/orderEvents.js";

const PAYSTACK_TEST_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY;

export async function paystackWebhookHandler(req: Request, res: Response) {
  const sig = Buffer.from(req.header("x-paystack-signature") ?? "");
  const expected = Buffer.from(
    crypto
      .createHmac("sha512", PAYSTACK_TEST_SECRET_KEY!)
      .update(req.body)
      .digest("hex"),
  );
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected))
    return res.sendStatus(401);

  const event = JSON.parse(req.body.toString());
  if (event.event !== "charge.success") return res.sendStatus(200); // ignore others

  try {
    const d = event.data;
    await markPaid(d.reference, d.amount, d.currency, d.channel);
    return res.sendStatus(200);
  } catch (e) {
    console.error("[paystack webhook]", e);
    return res.sendStatus(500); // Paystack retries on non-200
  }
}

export async function markPaid(
  reference: string,
  amountKobo: number,
  currency: string,
  channel?: string,
) {
  const order = await prisma.customerOrder.findUnique({
    where: { id: reference },
    select: { id: true, totalPrice: true },
  });
  if (!order) {
    console.error("[markPaid] unknown reference", reference);
    return;
  }

  if (currency !== "NGN" || amountKobo !== Math.round(order.totalPrice * 100)) {
    console.error("[markPaid] amount mismatch", {
      reference,
      amountKobo,
      expected: order.totalPrice,
    });
    return;
  }

  const result = prisma.$transaction(
    async (tx) => {
      // guard: only the first PENDING -> PAID transition proceeds
      const { count } = await tx.customerOrder.updateMany({
        where: { id: order.id, paymentStatus: { not: "Paid" } },
        data: {
          paymentStatus: "Paid",
          paidAt: new Date(),
          paymentChannel: channel,
        },
      });
      if (count === 0) return { firstTime: false, orders: [] }; // duplicate webhook or verify call

      await tx.order.updateMany({
        where: { customerOrderId: order.id, status: "Pending" }, // guard: don't clobber later states
        data: { status: "Received" },
      });

      const orders = await tx.order.findMany({
        where: { customerOrderId: order.id },
        select: { id: true, orderNumber: true, branchId: true }, // adjust field name
      });
      await tx.orderSyncJob.createMany({
        data: orders.map((o) => ({ orderId: o.id })),
        skipDuplicates: true, // needs @unique on OrderSyncJob.orderId
      });
      return { firstTime: true, orders };
    },
    { timeout: 15000 },
  );
  if ((await result).firstTime) {
    for (const o of (await result).orders) orderEvents.emit("order.paid", o);
  }
  return result;
}
