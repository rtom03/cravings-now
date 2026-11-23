// controllers/order.controller.ts
import { Request, Response } from "express";
import { createOrder } from "../services/order/createOrderService";
import { prisma } from "../utils/db";
import { paystack } from "../services/paystack/paystack";
import { markPaid } from "./paystackWebhookHandler";
import { IDParams } from "./branchController";
import { priceCart } from "../services/pricing";
import {
  parseId,
  parseListQuery,
  parseReplaceBody,
  parseStatusBody,
  parseVoidBody,
} from "../services/order/order.validation";
import { listOrders } from "../services/order/getOrderService";
import { Prisma } from "../generated/prisma/client";
import {
  replaceOrder,
  updateStatus,
  voidOrder,
} from "../services/order/updateOrderService";

// Roles that may act across every branch (adjust to your role names)
const ALL_BRANCH_ROLES = ["ADMIN"];

export interface Actor {
  id: string;
  /** null = may act across all branches */
  branchId: string | null;
}

export const detailInclude = {
  branch: { select: { id: true, name: true } },
  customer: true,
  products: true,
  payments: true,
  charges: true,
  syncJob: true,
} satisfies Prisma.OrderInclude;
// Adjust to however your authenticate middleware attaches the user

export const scoped = (id: string, actor: Actor): Prisma.OrderWhereInput => ({
  id,
  ...(actor.branchId ? { branchId: actor.branchId } : {}),
});

function actorOf(req: Request): Actor {
  const user = (req as any).user;
  // console.log(user, "ACTOR");
  return {
    id: user.id,
    branchId: ALL_BRANCH_ROLES.includes(user.role)
      ? null
      : (user.branchId ?? "__none__"),
  };
}

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey)
      return res.status(400).json({ error: "Idempotency-Key header required" });

    const order = await createOrder({ ...req.body, idempotencyKey }); // frontend owns input validation, per your stated approach
    return res.status(201).json(order);
  } catch (err) {
    console.error("createOrder failed:", err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Failed to create order",
    });
  }
}

// GET /api/orders/:id/payment-status
export async function paymentStatusHandler(
  req: Request<IDParams>,
  res: Response,
) {
  const order = await prisma.customerOrder.findUnique({
    where: { id: req.params.id },
  });
  if (!order /* || order.customerId !== req.user.id */)
    return res.sendStatus(404);

  if (order.paymentStatus === "Pending") {
    const { data } = await paystack.get(
      `/transaction/verify/${encodeURIComponent(order.id)}`,
    );
    if (data.data.status === "success")
      await markPaid(
        order.id,
        data.data.amount,
        data.data.currency,
        data.data.channel,
      );
  }
  const fresh = await prisma.customerOrder.findUnique({
    where: { id: order.id },
    select: { paymentStatus: true },
  });
  res.json(fresh);
}

// POST /api/orders/quote
export async function quoteHandler(req: Request, res: Response) {
  try {
    const { quote } = await priceCart(req.body);
    // console.log(quote.items.map((m) => m.foodicsSandboxId));
    res.json(quote);
  } catch (e: any) {
    console.log(e);
    res.status(e.status ?? 400).json({ error: e.message });
  }
}

export async function listOrdersHandler(req: Request, res: Response) {
  try {
    const result = await listOrders(parseListQuery(req.query), actorOf(req));
    res.json(result);
  } catch (e: any) {
    console.log(e);
    res.status(e.status ?? 400).json({ error: e.message });
  }
}

export async function updateOrderStatusHandler(
  req: Request<IDParams>,
  res: Response,
) {
  try {
    const order = await updateStatus(
      parseId(req.params.id),
      parseStatusBody(req.body),
      actorOf(req),
    );
    res.json(order);
  } catch (e: any) {
    console.log(e);
    res.status(e.status ?? 400).json({ error: e.message });
  }
}

export async function voidOrderHandler(req: Request, res: Response) {
  try {
    const order = await voidOrder(
      parseId(req.params.id),
      parseVoidBody(req.body),
      actorOf(req),
    );
    res.json(order);
  } catch (e: any) {
    console.log(e);
    res.status(e.status ?? 400).json({ error: e.message });
  }
}

export async function replaceOrderHandler(req: Request, res: Response) {
  try {
    const order = await replaceOrder(
      parseId(req.params.id),
      parseReplaceBody(req.body),
      actorOf(req),
    );
    res.json(order);
  } catch (e: any) {
    console.log(e);
    res.status(e.status ?? 400).json({ error: e.message });
  }
}
