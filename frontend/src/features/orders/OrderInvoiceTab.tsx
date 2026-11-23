import { Pencil } from "lucide-react";
import { Order } from "../../types/order";
import OrderProductsTable from "./OrderProductsTable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderAddress {
  country: string;
  area: string;
  block: string;
  street: string;
  building: string;
}

export interface OrderInvoiceData {
  trackingCode: string;
  paymentType: string;
  paymentMethod: string;
  expectedDate: string;
  expectedTimeRange: string;
  placedAt: string;
  receivedAt: string;
  branch: string;
  customerName: string;
  customerPhone: string;
  address: OrderAddress;
}

interface OrderInvoiceTabProps {
  data: Order;
  onEditDeliveryTime?: () => void;
  onEditBranch?: () => void;
  onEditDeliveryAddress?: () => void;
  onEditCustomer?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const EditBtn = ({
  onClick,
  label,
}: {
  onClick?: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="inline-flex items-center gap-0.5 text-[12px] text-sky-500 hover:text-sky-600 bg-transparent border-none cursor-pointer transition-colors ml-1.5"
  >
    <Pencil size={11} />
    Edit
  </button>
);

// One label + value row — label is always bold, value is muted
const Row = ({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) => (
  <div
    className={`grid gap-x-2 mb-1.5 ${align === "start" ? "items-start" : "items-baseline"}`}
    style={{ gridTemplateColumns: "140px 1fr" }}
  >
    <span className="text-[13px] font-semibold text-gray-800">{label}</span>
    <span className="text-[13px] text-gray-500">{children}</span>
  </div>
);

const SectionGap = () => <div className="h-3" />;
const Divider = () => <div className="border-t border-gray-100 my-4" />;

// ─── Root component ───────────────────────────────────────────────────────────

export const OrderInvoiceTab = ({
  data,
  onEditDeliveryTime,
  onEditBranch,
  onEditDeliveryAddress,
  onEditCustomer,
}: OrderInvoiceTabProps) => (
  <div className="py-1">
    {/* ── Invoice header ───────────────────────────────────────────────────── */}
    <p className="text-[15px] font-semibold text-gray-900 mb-3">Invoice</p>
    <Row label="Tracking Code:">{data.trackingCode}</Row>
    <Row label="Payment Type:">{data.type}</Row>
    <Row label="Payment Method:">{data.type}</Row>
    <SectionGap />
    {/* ── Expected delivery ────────────────────────────────────────────────── */}
    <Row label="Expected Delivery:" align="start">
      <span>
        <span className="underline block">{data.createdAt}</span>
        <span className="underline">{data.closedAt}</span>
        <EditBtn onClick={onEditDeliveryTime} label="Edit delivery time" />
      </span>
    </Row>
    <SectionGap />
    <Row label="Placed:">{data.openedAt}</Row>
    <Row label="Received:">{data.updatedAt}</Row>
    <SectionGap />
    <Row label="Branch:">
      {data.branch?.name}
      <EditBtn onClick={onEditBranch} label="Edit branch" />
    </Row>
    <Divider />
    {/* ── Deliver to ───────────────────────────────────────────────────────── */}
    <div className="flex items-center gap-1 mb-3">
      <p className="text-[15px] font-semibold text-gray-900">Deliver to</p>
      <EditBtn onClick={onEditDeliveryAddress} label="Edit delivery address" />
    </div>
    <Row label="Customer:" align="start">
      <span>
        <span className="block">{data.customer?.name}</span>
        <span>xxxxxxxx</span>
      </span>
    </Row>
    <Row label="Address:" align="start">
      <span className="leading-relaxed">
        <br />
        {/* <BoldLabel>Block:</BoldLabel> {data.address.block},{" "}
        <BoldLabel>Street:</BoldLabel> {data.address.street},{" "}
        <BoldLabel>Building:</BoldLabel> {data.address.building} */}
      </span>
    </Row>
    <Divider />
    <OrderProductsTable
      products={data.products}
      currency="NGN"
      vatRate={0.075}
      onAddRemark={() => console.log("add remark")}
    />
  </div>
);

// tiny inline helper — keeps address bold labels DRY
const BoldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-gray-800">{children}</span>
);

export default OrderInvoiceTab;

// ─── Sample data ──────────────────────────────────────────────────────────────
