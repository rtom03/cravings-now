import { prisma } from "../../utils/db";
import { initializePaystackTransaction } from "../paystack/paystack";
import { Prisma } from "../../generated/prisma/client";
import { randomBytes, randomUUID, createHash } from "crypto";
import { priceCart } from "../pricing";
export async function createOrder(input) {
    const key = input.idempotencyKey; // controller: req.header("Idempotency-Key")
    const requestHash = createHash("sha256")
        .update(JSON.stringify({
        c: input.customerId,
        a: input.customerAddressId,
        k: input.couponCode ?? null,
        p: [...input.products]
            .map((p) => ({
            id: p.productId,
            q: p.quantity,
            o: (p.options ?? [])
                .map((o) => `${o.modifierOptionId}:${o.quantity}`)
                .sort(),
        }))
            .sort((x, y) => x.id.localeCompare(y.id)),
    }))
        .digest("hex");
    if (key) {
        const existing = await prisma.customerOrder.findUnique({
            where: { idempotencyKey: key },
        });
        if (existing)
            return replay(existing, requestHash);
    }
    function replay(existing, hash) {
        if (existing.requestHash !== hash)
            throw Object.assign(new Error("Idempotency key reused with a different request"), { status: 422 });
        if (!existing.paystackAuthUrl)
            throw Object.assign(new Error("Order is still being processed, retry shortly"), { status: 409 });
        return {
            ...existing,
            authorizationUrl: existing.paystackAuthUrl,
            replayed: true,
        };
    }
    const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford, no I/L/O/U
    const makeTrackingCode = () => {
        let s = "";
        for (const b of randomBytes(8))
            s += ALPHABET[b % 32]; // 256 % 32 === 0, no bias
        return `CN-${s}`;
    };
    const businessDate = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }));
    const { quote, internal } = await priceCart(input);
    // price drift: the client confirmed a total that is no longer correct
    // if (
    //   input.expectedTotalKobo != null &&
    //   input.expectedTotalKobo !== quote.totalKobo
    // ) {
    //   throw Object.assign(new Error("Price changed"), { status: 409, quote });
    // }
    const { builtOrders, chargeLines, paystackSplit, couponId, customerId, customerOrder: totals, } = internal;
    const totalKobo = quote.totalKobo;
    const customerOrderId = randomUUID();
    const commitOrder = () => prisma.$transaction(async (tx) => {
        await tx.customerOrder.create({
            data: {
                id: customerOrderId,
                customerId: input.customerId,
                customerAddressId: input.customerAddressId,
                subtotalPrice: totals.subtotalPrice,
                totalPrice: totals.totalPrice,
                couponId,
                dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
                paystackReference: customerOrderId,
                idempotencyKey: key,
                requestHash,
                charges: { create: chargeLines },
            },
        });
        const orderRows = [];
        const productRows = [];
        const optionRows = [];
        for (const built of builtOrders) {
            const orderId = randomUUID();
            const c = await tx.orderCounter.upsert({
                where: {
                    storeId_businessDate: { storeId: built.branchId, businessDate },
                },
                create: { storeId: built.branchId, businessDate, last: 100 },
                update: { last: { increment: 1 } },
            });
            const ordNum = c.last;
            console.log(ordNum);
            orderRows.push({
                id: orderId,
                customerOrderId,
                type: "DELIVERY",
                source: "API",
                status: "Pending",
                guests: 1,
                kitchenNotes: "",
                customerNotes: "",
                businessDate,
                subtotalPrice: built.subtotalKobo / 100,
                orderNumber: ordNum,
                trackingCode: makeTrackingCode(),
                discountAmount: built.discountKobo / 100,
                totalPrice: built.payableKobo / 100,
                roundingAmount: 0,
                branchId: built.branchId,
                customerId,
            });
            for (const line of built.productLines) {
                const opId = randomUUID();
                productRows.push({
                    id: opId,
                    orderId,
                    productId: line.productId,
                    foodicsId: line.foodicsId,
                    foodicsSandBoxId: line.foodicsSandBoxId,
                    quantity: line.quantity,
                    unitPrice: line.unitKobo,
                    totalPrice: line.lineKobo,
                    totalCost: 0,
                    discountAmount: 0,
                    addedAt: new Date(),
                });
                for (const opt of line.options ?? []) {
                    optionRows.push({
                        id: randomUUID(),
                        orderProductId: opId,
                        modifierOptionId: opt.modifierOptionId,
                        foodicsId: opt.foodicsId,
                        foodicsSandBoxId: opt.foodicsSandBoxId,
                        quantity: opt.quantity,
                        unitPrice: opt.unitKobo,
                        totalPrice: opt.lineKobo,
                        totalCost: 0,
                    });
                }
            }
        }
        await tx.order.createMany({ data: orderRows });
        await tx.orderProduct.createMany({ data: productRows });
        await tx.orderProductOption.createMany({ data: optionRows });
        // await tx.orderSyncJob.createMany({
        //   data: orderRows.map((o) => ({ orderId: o.id! })),
        // });
    }, { timeout: 15000 });
    const [txRes, payRes] = await Promise.allSettled([
        commitOrder(),
        initializePaystackTransaction({
            customerEmail: input.customerEmail,
            amountKobo: totalKobo,
            reference: customerOrderId,
            split: paystackSplit,
        }),
    ]);
    if (txRes.status === "rejected") {
        const e = txRes.reason;
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002" && key) {
                const existing = await prisma.customerOrder.findUnique({
                    where: { idempotencyKey: key },
                });
                if (existing)
                    return replay(existing, requestHash); // lost the race
            }
            if (e.code === "P2003")
                throw Object.assign(new Error("Invalid customer or address"), {
                    status: 400,
                });
        }
        throw e;
    }
    if (payRes.status === "rejected") {
        console.error("[createOrder] paystack init failed", payRes.reason);
        throw Object.assign(new Error("Payment initialization failed, please retry"), { status: 502 });
    }
    const authorizationUrl = payRes.value.authorization_url;
    const customerOrder = await prisma.customerOrder.update({
        where: { id: customerOrderId },
        data: {
            paystackAuthUrl: authorizationUrl,
            paystackReference: payRes.value.reference,
        },
    });
    return { ...customerOrder, authorizationUrl };
}
