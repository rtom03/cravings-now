import { useState } from "react";
import { Printer, Eye, Loader } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PrintSize = "A4" | "Thermal" | "Preparation";
type PrintView = "Show options" | "Hide options";
type OrderStatus = "Received" | "Preparing" | "Delivering" | "Complete";
type PaymentStatus = "Complete" | "Incomplete";

interface OrderActionsTabProps {
  orderId: string;
  initialOrderStatus?: OrderStatus;
  initialPaymentStatus?: PaymentStatus;
  onOrderStatusChange?: (status: OrderStatus) => Promise<void>;
  onPaymentStatusChange?: (status: PaymentStatus) => Promise<void>;
  onCancelOrder?: () => void;
}

// ─── Print API ────────────────────────────────────────────────────────────────
//
// fetchPrintData hits your backend to get the rendered receipt/invoice URL
// or raw HTML for the selected size and language.
//
// What it does:
//  1. Sends a POST to /api/orders/:orderId/print with { size, lang, showOptions }
//  2. The backend returns { url } — a pre-signed URL or a blob URL
//     pointing to the generated PDF / thermal receipt.
//  3. handlePrint   → opens that URL in a new tab and triggers window.print()
//  4. handleView    → opens that URL in a new tab for preview only
//
// Swap the fetch call for your actual API client (axios, react-query, etc.)

async function fetchPrintData(
  orderId: string,
  size: PrintSize,
  showOptions: boolean,
): Promise<{ url: string }> {
  const res = await fetch(`/api/orders/${orderId}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ size, showOptions }),
  });
  if (!res.ok) throw new Error(`Print API failed: ${res.status}`);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ButtonGroup renders a row of mutually exclusive option buttons.
// `value` is the currently selected option; clicking any button calls onChange.

function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  variant = "default",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  variant?: "default" | "warning";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isActive = opt === value;
        const warningActive = variant === "warning" && isActive;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3.5 py-1.5 text-[12px] rounded-md border transition-colors ${
              warningActive
                ? "border-orange-400 text-orange-400 bg-transparent"
                : isActive
                  ? "bg-sky-500 text-white border-sky-500"
                  : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-gray-400 mb-2">{children}</p>;
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="mb-5">{children}</div>;
}

// ─── Root component ───────────────────────────────────────────────────────────

export const OrderActionsTab = ({
  orderId,
  initialOrderStatus = "Complete",
  initialPaymentStatus = "Complete",
  onOrderStatusChange,
  onPaymentStatusChange,
  onCancelOrder,
}: OrderActionsTabProps) => {
  // ── print state ──
  const [printSize, setPrintSize] = useState<PrintSize>("A4");
  const [printView, setPrintView] = useState<PrintView>("Show options");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // ── order / payment state ──
  const [orderStatus, setOrderStatus] =
    useState<OrderStatus>(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(initialPaymentStatus);

  // ── print helpers ──────────────────────────────────────────────────────────
  //
  // Both handlePrint and handleView share the same API call.
  // The only difference is what happens with the returned URL:
  //   • handlePrint  → opens it then triggers the browser print dialog
  //   • handleView   → opens it as a plain preview tab
  //
  const getPrintUrl = async () => {
    setIsPrinting(true);
    setPrintError(null);
    try {
      const showOptions = printView === "Show options";
      const { url } = await fetchPrintData(orderId, printSize, showOptions);
      return url;
    } catch (err) {
      setPrintError(err instanceof Error ? err.message : "Print failed");
      return null;
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrint = async () => {
    const url = await getPrintUrl();
    if (!url) return;
    const win = window.open(url, "_blank");
    // Give the new tab a moment to load before firing the print dialog
    win?.addEventListener("load", () => win.print());
  };

  const handleView = async () => {
    const url = await getPrintUrl();
    if (url) window.open(url, "_blank");
  };

  // ── status change helpers ──────────────────────────────────────────────────
  //
  // Status changes call the optional callbacks so the parent (OrderDetailModal
  // or wherever this tab lives) can persist the change to the backend.
  // The local state updates optimistically — if you want pessimistic updates,
  // await the callback before calling setState.
  //
  const handleOrderStatus = async (status: OrderStatus) => {
    setOrderStatus(status);
    await onOrderStatusChange?.(status);
  };

  const handlePaymentStatus = async (status: PaymentStatus) => {
    setPaymentStatus(status);
    await onPaymentStatusChange?.(status);
  };

  return (
    <div>
      {/* ── Print ─────────────────────────────────────────────────────────── */}
      <Section>
        <SectionLabel>Print</SectionLabel>

        {/* Size */}
        <div className="mb-2">
          <ButtonGroup<PrintSize>
            options={["A4", "Thermal", "Preparation"]}
            value={printSize}
            onChange={setPrintSize}
          />
        </div>

        {/* Show / Hide options */}
        <div className="mb-3">
          <ButtonGroup<PrintView>
            options={["Show options", "Hide options"]}
            value={printView}
            onChange={setPrintView}
          />
        </div>

        {/* Print error */}
        {printError && (
          <p className="text-[12px] text-red-500 mb-2">{printError}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPrinting ? (
              <Loader size={13} className="animate-spin" />
            ) : (
              <Printer size={13} />
            )}
            Print
          </button>
          <button
            type="button"
            onClick={handleView}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={13} />
            View
          </button>
        </div>
      </Section>

      {/* ── Order Status ──────────────────────────────────────────────────── */}
      <Section>
        <SectionLabel>Order Status</SectionLabel>
        <ButtonGroup<OrderStatus>
          options={["Received", "Preparing", "Delivering", "Complete"]}
          value={orderStatus}
          onChange={handleOrderStatus}
        />
      </Section>

      {/* ── Payment Status ────────────────────────────────────────────────── */}
      <Section>
        <SectionLabel>Payment Status</SectionLabel>
        <ButtonGroup<PaymentStatus>
          options={["Complete", "Incomplete"]}
          value={paymentStatus}
          onChange={handlePaymentStatus}
          variant="warning" // Incomplete renders in orange
        />
      </Section>

      {/* ── Change Order ──────────────────────────────────────────────────── */}
      <Section>
        <SectionLabel>Change Order</SectionLabel>
        <button
          type="button"
          onClick={onCancelOrder}
          className="px-3.5 py-1.5 text-[12px] border border-red-400 text-red-500 rounded-md bg-transparent hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
      </Section>
    </div>
  );
};

export default OrderActionsTab;
