export type OrderStatus =
  | "Pending"
  | "Active"
  | "Declined"
  | "Closed"
  | "Returned"
  | "Void"
  | "Joined"
  | "Draft";
export type OrderType = string; // your OrderType enum values
export type OrderSource = string; // your OrderSource enum values

export interface OrderBranch {
  id: string;
  name: string;
  groupName?: string | null;
}

interface OrderProductOption {
  id: string;
  foodicsId: string;
  foodicsSandBoxId?: string;
  sku: string;
  name: string;
  image: string | null;
  nameLocalized: string | null;
  quantity: number;
  isActive: boolean;
  isInStock: boolean;
  price: number;
  modifierOption: { id: string; name: string };
}

export interface OrderProduct {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number; // stored in kobo/cents — divide by 100
  totalPrice: number; // stored in kobo/cents — divide by 100
  totalCost: number;
  discountAmount: number;
  addedAt: string;
  closedAt: string | null;
  kitchenNotes: string | null;
  voidTag: string | null;
  options: OrderProductOption[];
  product: { id: string; name: string };
  sku?: string;
}

export interface Order {
  id: string;
  foodicsId: string | null;
  reference: string | null;
  orderNumber: number;
  trackingCode: string;
  type: OrderType;
  source: OrderSource;
  status: OrderStatus;
  guests: number;
  kitchenNotes: string | null;
  customerNotes: string | null;
  businessDate: string;
  subtotalPrice: number;
  discountAmount: number;
  roundingAmount: number;
  totalPrice: number;
  branchId: string;
  customerId: string | null;
  driverId: string | null;
  tableId: string | null;
  dueAt: string | null;
  openedAt: string | null;
  closedAt: string | null;
  meta: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  branch?: OrderBranch;
  customer?: { id: string; name: string } | null;
  products: OrderProduct[];
}

export interface OrderDetail extends Order {
  payments: any[];
  charges: any[];
  syncJob: any | null;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | OrderStatus[];
  type?: OrderType | OrderType[];
  source?: OrderSource | OrderSource[];
  branchId?: string;
  groupName?: string;
  customerId?: string;
  driverId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  search?: string;
  sortBy?: "createdAt" | "businessDate" | "totalPrice" | "number";
  sortOrder?: "asc" | "desc";
}

export interface ListOrdersResponse {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateOrderInput {
  guests: number;
  kitchenNotes: string | null;
  customerNotes: string | null;
  tableId: string | null;
  driverId: string | null;
  dueAt: string | null;
}
