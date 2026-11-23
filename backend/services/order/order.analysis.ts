// // ---- Types (mirror the backend; adjust enum values to your Prisma enums) ----
// export type OrderStatus =
//   "Pending" | "Active" | "Declined" | "Closed" | "Returned" | "Void";
// export type OrderType = string; // your OrderType enum values
// export type OrderSource = string; // your OrderSource enum values

// export interface OrderBranch {
//   id: string;
//   name: string;
//   groupName?: string | null;
// }

// export interface Order {
//   id: string;
//   foodicsId: string | null;
//   reference: string | null;
//   number: number | null;
//   type: OrderType;
//   source: OrderSource;
//   status: OrderStatus;
//   guests: number;
//   kitchenNotes: string | null;
//   customerNotes: string | null;
//   businessDate: string;
//   subtotalPrice: number;
//   discountAmount: number;
//   roundingAmount: number;
//   totalPrice: number;
//   branchId: string;
//   customerId: string | null;
//   driverId: string | null;
//   tableId: string | null;
//   dueAt: string | null;
//   openedAt: string | null;
//   closedAt: string | null;
//   meta: Record<string, any> | null;
//   createdAt: string;
//   updatedAt: string;
//   branch?: OrderBranch;
//   customer?: { id: string } | null;
// }

// export interface OrderDetail extends Order {
//   products: any[];
//   payments: any[];
//   charges: any[];
//   syncJob: any | null;
// }

// export interface ListOrdersParams {
//   page?: number;
//   limit?: number;
//   status?: OrderStatus | OrderStatus[];
//   type?: OrderType | OrderType[];
//   source?: OrderSource | OrderSource[];
//   branchId?: string;
//   groupName?: string;
//   customerId?: string;
//   driverId?: string;
//   from?: string; // YYYY-MM-DD
//   to?: string; // YYYY-MM-DD
//   search?: string;
//   sortBy?: "createdAt" | "businessDate" | "totalPrice" | "number";
//   sortOrder?: "asc" | "desc";
// }

// export interface ListOrdersResponse {
//   items: Order[];
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// export interface UpdateOrderInput {
//   guests: number;
//   kitchenNotes: string | null;
//   customerNotes: string | null;
//   tableId: string | null;
//   driverId: string | null;
//   dueAt: string | null;
// }

// // ---- Helpers ----
// const toQuery = (params: ListOrdersParams): string => {
//   const qs = new URLSearchParams();
//   Object.entries(params).forEach(([key, value]) => {
//     if (value === undefined || value === null || value === "") return;
//     qs.set(key, Array.isArray(value) ? value.join(",") : String(value));
//   });
//   const s = qs.toString();
//   return s ? `?${s}` : "";
// };

// const json = { "Content-Type": "application/json" };

// // ---- Service ----
// // const listOrders = async (
// //   params: ListOrdersParams = {},
// // ): Promise<ListOrdersResponse> => {
// //   return apiFetch(`/orders${toQuery(params)}`);
// // };

// // const getOrder = async (id: string): Promise<OrderDetail> => {
// //   return apiFetch(`/orders/${id}`);
// // };

// const updateOrder = async (
//   id: string,
//   data: UpdateOrderInput,
// ): Promise<OrderDetail> => {
//   return apiFetch(`/orders/${id}`, {
//     method: "PUT",
//     headers: json,
//     body: JSON.stringify(data),
//   });
// };

// const updateOrderStatus = async (
//   id: string,
//   status: Exclude<OrderStatus, "Void">,
// ): Promise<OrderDetail> => {
//   return apiFetch(`/orders/${id}/status`, {
//     method: "PATCH",
//     headers: json,
//     body: JSON.stringify({ status }),
//   });
// };

// // const voidOrder = async (id: string, reason: string): Promise<OrderDetail> => {
// //   return apiFetch(`/orders/${id}/void`, {
// //     method: "PATCH",
// //     headers: json,
// //     body: JSON.stringify({ reason }),
// //   });
// // };

// export const orderService = {
//   // listOrders,
//   // getOrder,
//   updateOrder,
//   updateOrderStatus,
//   // voidOrder,
// };
