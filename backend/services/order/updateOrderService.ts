import { prisma } from "../../utils/db.js";
import { OrderStatus, Prisma } from "../../generated/prisma/client.js";
import { getOrder } from "./getOrderService.js";
import { OrderError, ReplaceOrderBody } from "./order.validation.js";
import { Actor, detailInclude, scoped } from "../../controller/orderController.js";

// Allowed status transitions. Terminal states have no exits.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Store reviews a new order
  [OrderStatus.Pending]: [
    OrderStatus.Received,
    OrderStatus.Cancelled,
    OrderStatus.Voided,
  ],

  // Accepted, not started yet
  [OrderStatus.Received]: [
    OrderStatus.Preparing,
    OrderStatus.Cancelled,
    OrderStatus.Voided,
  ],

  // Kitchen is working on it. Delivery orders wait for a driver, pickup orders wait for the customer
  [OrderStatus.Preparing]: [
    OrderStatus.Ready_To_Collect,
    OrderStatus.Driver_Pending,
    OrderStatus.Cancelled,
    OrderStatus.Voided,
  ],

  // Pickup: customer collects it. Delivery: driver collects it
  [OrderStatus.Ready_To_Collect]: [
    OrderStatus.Complete,
    OrderStatus.Out_For_Delivery,
    OrderStatus.Cancelled,
    OrderStatus.Voided,
  ],

  // Delivery order waiting for a driver
  [OrderStatus.Driver_Pending]: [
    OrderStatus.Out_For_Delivery,
    OrderStatus.Cancelled,
    OrderStatus.Voided,
  ],

  // With the driver. Can be delivered or fail (cancel), but not voided
  [OrderStatus.Out_For_Delivery]: [OrderStatus.Complete, OrderStatus.Cancelled],

  // Finished; the only thing left is a refund
  [OrderStatus.Complete]: [OrderStatus.Refunded],

  // Cancelled orders may still need their payment refunded
  [OrderStatus.Cancelled]: [OrderStatus.Refunded],

  // Final
  [OrderStatus.Voided]: [],
  [OrderStatus.Refunded]: [],
};

const isEditable = (s: OrderStatus) =>
  s === OrderStatus.Pending || s === OrderStatus.Received;

async function findOrThrow(id: string, actor: Actor) {
  const order = await prisma.order.findFirst({ where: scoped(id, actor) });
  if (!order) throw new OrderError(404, "Order not found");
  return order;
}

// PUT — replace the editable fields
export async function replaceOrder(
  id: string,
  body: ReplaceOrderBody,
  actor: Actor,
) {
  const order = await findOrThrow(id, actor);
  if (!isEditable(order.status)) {
    throw new OrderError(
      409,
      `Orders with status "${order.status}" can no longer be edited`,
    );
  }

  try {
    return await prisma.order.update({
      where: { id },
      data: body,
      include: detailInclude,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      throw new OrderError(
        400,
        "Invalid reference (driver or table does not exist)",
      );
    }
    throw e;
  }
}

// PATCH /:id/status
export async function updateStatus(
  id: string,
  next: OrderStatus,
  actor: Actor,
) {
  if (next === OrderStatus.Voided) {
    throw new OrderError(400, "Use PATCH /orders/:id/void to void an order");
  }

  const order = await findOrThrow(id, actor);
  if (!TRANSITIONS[order.status].includes(next)) {
    throw new OrderError(
      409,
      `Cannot change status from "${order.status}" to "${next}"`,
    );
  }

  const now = new Date();
  const data: Prisma.OrderUncheckedUpdateManyInput = {
    status: next,
    ...(next === OrderStatus.Received && !order.openedAt && { openedAt: now }),
    ...(next === OrderStatus.Complete && {
      closedAt: now,
      closerId: actor.id,
    }),
  };

  // Guard against concurrent changes: only update if status is still what we read
  const { count } = await prisma.order.updateMany({
    where: { id, status: order.status },
    data,
  });
  if (count === 0)
    throw new OrderError(
      409,
      "Order was modified by someone else, please retry",
    );

  return getOrder(id, actor);
}

// PATCH /:id/void — soft void, reason kept in meta.void
export async function voidOrder(id: string, reason: string, actor: Actor) {
  const order = await findOrThrow(id, actor);
  if (!TRANSITIONS[order.status].includes(OrderStatus.Voided)) {
    throw new OrderError(
      409,
      `Orders with status "${order.status}" cannot be voided`,
    );
  }

  const meta = (
    order.meta && typeof order.meta === "object" && !Array.isArray(order.meta)
      ? order.meta
      : {}
  ) as Prisma.JsonObject;

  const { count } = await prisma.order.updateMany({
    where: { id, status: order.status },
    data: {
      status: OrderStatus.Voided,
      closedAt: new Date(),
      closerId: actor.id,
      meta: {
        ...meta,
        void: { reason, by: actor.id, at: new Date().toISOString() },
      },
    },
  });
  if (count === 0)
    throw new OrderError(
      409,
      "Order was modified by someone else, please retry",
    );

  return getOrder(id, actor);
}
