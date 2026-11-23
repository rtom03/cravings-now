import { Plus } from "lucide-react";
import { OrderProduct } from "../../types/order";

// ─── Types ────────────────────────────────────────────────────────────────────
// Matches the exact shape coming back from your API

export interface OrderProductsTableProps {
  products: OrderProduct[];
  currency?: string; // default "NGN"
  vatRate?: number; // default 0.075
  onAddRemark?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// API stores prices in kobo (smallest unit) — divide by 100 to get Naira
const toNaira = (kobo: number) => kobo / 100;

const fmt = (amount: number, currency: string) =>
  amount === 0
    ? "0.00"
    : `${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currency}`;

// Derive a display name from the product data.
// Priority: enriched productName → sku fallback → productId slice
const getProductLabel = (p: OrderProduct) =>
  p.product.name
    ? p.sku
      ? `${p.product.name} (${p.sku})`
      : p.product.name
    : `Product …${p.productId.slice(-8)}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const Th = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) => (
  <th
    className={`px-3 py-2.5 text-[11px] font-medium text-gray-400 whitespace-nowrap border-b border-gray-100 text-${align}`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  align = "left",
  bold = false,
  muted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  bold?: boolean;
  muted?: boolean;
}) => (
  <td
    className={`px-3 py-2.5 text-[13px] border-b border-gray-100
      text-${align}
      ${bold ? "font-semibold text-gray-800" : ""}
      ${muted ? "text-gray-400" : "text-gray-600"}
    `}
  >
    {children}
  </td>
);

// A single product row — bold for the main item
interface ProductRowProps {
  label: string;
  price: number;
  qty: number;
  total: number;
  currency: string;
  isMain?: boolean;
}

const ProductRow = ({
  label,
  price,
  qty,
  total,
  currency,
  isMain,
}: ProductRowProps) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <Td bold={isMain}>{label}</Td>
    <Td bold={isMain}>{fmt(price, isMain ? currency : "")}</Td>
    <Td bold={isMain}>x {qty}</Td>
    <Td align="right" bold={isMain}>
      {fmt(total, currency)}
    </Td>
  </tr>
);

// A modifier/option row indented under the main product
const OptionRow = ({
  label,
  qty,
  currency,
}: {
  label: string;
  qty: number;
  currency: string;
}) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <Td muted>
      <span className="pl-3">{label}</span>
    </Td>
    <Td muted>0.00</Td>
    <Td muted>x {qty}</Td>
    <Td align="right" muted>
      0.00 {currency}
    </Td>
  </tr>
);

// ─── Root component ───────────────────────────────────────────────────────────

export const OrderProductsTable = ({
  products,
  currency = "NGN",
  vatRate = 0.075,
  onAddRemark,
}: OrderProductsTableProps) => {
  // ── totals ──────────────────────────────────────────────────────────────────
  // totalPrice from API is in kobo — convert all arithmetic to Naira first
  const subtotal = products.reduce((s, p) => s + toNaira(p.totalPrice), 0);
  const grossAmount = subtotal / (1 + vatRate); // pre-tax base
  const vatAmount = subtotal - grossAmount; // VAT portion

  return (
    <div className="py-2">
      <p className="text-[14px] font-semibold text-gray-800 mb-3">
        Your order:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-100">
              <Th>Product</Th>
              <Th>Price</Th>
              <Th>Quantity</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <>
                {/* Main product row */}
                <ProductRow
                  key={product.id}
                  label={getProductLabel(product)}
                  price={toNaira(product.unitPrice)}
                  qty={product.quantity}
                  total={toNaira(product.totalPrice)}
                  currency={currency}
                  isMain
                />

                {/* Modifier / option rows — indented below the main product */}
                {product.options.map((opt) => (
                  <OptionRow
                    key={opt.id}
                    label={
                      opt.modifierOption.name ?? `Option …${opt.id.slice(-6)}`
                    }
                    qty={opt.quantity}
                    currency={currency}
                  />
                ))}
              </>
            ))}

            {/* ── VAT row ──────────────────────────────────────────────────── */}
            <tr className="hover:bg-gray-50 transition-colors">
              <Td muted>VAT @ {(vatRate * 100).toFixed(2)}%</Td>
              <Td muted>{fmt(vatAmount, currency)}</Td>
              <Td muted>Gross Amount</Td>
              <Td align="right" muted>
                {fmt(grossAmount, currency)}
              </Td>
            </tr>

            {/* ── Total row ─────────────────────────────────────────────────── */}
            <tr>
              <td
                colSpan={3}
                className="px-3 py-2.5 text-[13px] font-medium text-gray-700 border-t border-gray-100"
              >
                Total
              </td>
              <td className="px-3 py-2.5 text-[13px] font-medium text-gray-800 text-right border-t border-gray-100">
                {fmt(subtotal, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Special remarks ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[13px] font-semibold text-gray-800">
          Special remarks:
        </span>
        <button
          type="button"
          onClick={onAddRemark}
          className="flex items-center gap-0.5 text-[12px] text-sky-500 hover:text-sky-600 bg-transparent border-none cursor-pointer transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  );
};

export default OrderProductsTable;
