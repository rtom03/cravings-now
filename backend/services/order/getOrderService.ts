import { Actor, detailInclude, scoped } from "../../controller/orderController";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../utils/db";
import { ListOrdersQuery, OrderError } from "./order.validation";

export async function listOrders(q: ListOrdersQuery, actor: Actor) {
  const where: Prisma.OrderWhereInput = {
    // store users are locked to their own branch; branchId param applies to all-branch roles only
    ...(actor.branchId
      ? { branchId: actor.branchId }
      : q.branchId
        ? { branchId: q.branchId }
        : {}),
    ...(q.groupName && {
      branch: { groupName: { contains: q.groupName, mode: "insensitive" } },
    }),
    ...(q.status && { status: { in: q.status } }),
    ...(q.type && { type: { in: q.type } }),
    ...(q.customerId && { customerId: q.customerId }),
    ...((q.from || q.to) && {
      businessDate: {
        ...(q.from && { gte: q.from }),
        ...(q.to && { lte: q.to }),
      },
    }),
    ...(q.search && {
      OR: [
        { reference: { contains: q.search, mode: "insensitive" } },
        ...(/^\d+$/.test(q.search) ? [{ orderNumber: Number(q.search) }] : []),
      ],
    }),
  };

  // const [items, total] = await prisma.$transaction([
  //   prisma.order.findMany({
  //     where,
  //     orderBy: { [q.sortBy]: q.sortOrder },
  //     skip: (q.page - 1) * q.limit,
  //     take: q.limit,
  //     include: {
  //       customer: { select: { id: true, name: true } },
  //       branch: { select: { id: true, name: true, groupName: true } },
  //       products: {
  //         include: {
  //           product: { select: { id: true, name: true } },
  //           options: {
  //             include: {
  //               modifierOption: { select: { id: true, name: true } },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   }),
  //   prisma.order.count({ where }),
  // ]);
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ [q.sortBy]: q.sortOrder }, { id: "desc" }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        customer: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true, groupName: true } },
        _count: { select: { products: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    page: q.page,
    limit: q.limit,
    total,
    totalPages: Math.ceil(total / q.limit),
  };
}

export async function getOrder(id: string, actor: Actor) {
  const order = await prisma.order.findFirst({
    where: scoped(id, actor),
    include: detailInclude,
  });
  if (!order) throw new OrderError(404, "Order not found");
  return order;
}
