import { useEffect } from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalTab {
  key: string;
  label: string;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;

  // content
  title: string;
  children: React.ReactNode;

  // optional tabs — if omitted the tab bar is hidden
  tabs?: ModalTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;

  // optional footer actions — if omitted the footer is hidden
  onSave?: () => void;
  saveLabel?: string;
  closeLabel?: string;

  // width — defaults to max-w-[640px], pass any Tailwind max-w-* class
  maxWidth?: string;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function MiniModal({
  open,
  onClose,
  title,
  children,
  tabs,
  activeTab,
  onTabChange,
  onSave,
  saveLabel = "Save",
  closeLabel = "Close",
  maxWidth = "max-w-[640px]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasTabs = tabs && tabs.length > 0;
  const hasFooter = !!onSave;

  // grid-rows: header | (tabs?) | body | (footer?)
  const rows = [
    "auto",
    hasTabs ? "auto" : null,
    "1fr",
    hasFooter ? "auto" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ gridTemplateRows: rows }}
        className={`grid h-[88vh] w-full ${maxWidth} overflow-hidden rounded-xl border border-white/10 bg-[#0d0f14] shadow-2xl shadow-black/60`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs — only rendered when tabs are provided */}
        {hasTabs && (
          <div className="flex gap-5 justify-around overflow-x-auto border-b border-white/10 px-5 [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`relative whitespace-nowrap py-3 text-[13px] font-medium transition ${
                  activeTab === tab.key
                    ? "text-sky-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-sky-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Body — only scrollable region */}
        <div className="overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          {children}
        </div>

        {/* Footer — only rendered when onSave is provided */}
        {hasFooter && (
          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
            <button
              onClick={onClose}
              className="rounded-md border border-white/15 px-4 py-2 text-[13px] text-slate-300 hover:bg-white/5"
            >
              {closeLabel}
            </button>
            <button
              onClick={onSave}
              className="rounded-md bg-sky-500 px-4 py-2 text-[13px] font-medium text-white hover:bg-sky-400"
            >
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
