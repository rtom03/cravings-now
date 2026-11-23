// ─── Shimmer base ─────────────────────────────────────────────────────────────
// Same keyframe name your table already injects so there's no duplication.

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative overflow-hidden bg-white/[0.06] ${className}`}
    aria-hidden="true"
  >
    <div
      className="absolute inset-0 -translate-x-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        animation: "skeletonSweep 1.4s ease-in-out infinite",
      }}
    />
  </div>
);

// ─── Per-variant skeleton cell ────────────────────────────────────────────────
// Mirrors SkeletonCell variants your columns declare so each column gets
// a shimmer that matches the real content's shape exactly.

type SkeletonVariant =
  | "text"
  | "badge"
  | "dash"
  | "toggle"
  | "thumb"
  | "avatar";

const SkeletonCell = ({ variant = "text" }: { variant?: SkeletonVariant }) => {
  switch (variant) {
    case "badge":
      return <Shimmer className="h-5 w-16 rounded-full" />;
    case "dash":
      return <Shimmer className="h-3 w-4 rounded" />;
    case "toggle":
      return <Shimmer className="h-4 w-8 rounded-full" />;
    case "thumb":
      return <Shimmer className="h-9 w-9 rounded-md" />;
    case "avatar":
      return <Shimmer className="h-7 w-7 rounded-full" />;
    case "text":
    default:
      return <Shimmer className="h-3 w-[70%] rounded" />;
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkeletonColDef {
  key: string;
  width?: string;
  align?: "left" | "center" | "right";
  skeletonVariant?: SkeletonVariant;
}

interface DataTableSkeletonProps {
  columns: SkeletonColDef[];
  rows?: number; // how many skeleton rows to show — default 8
  selectable?: boolean; // renders the checkbox column when true
  minWidth?: string; // passed to the table's minWidth style
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const alignClass = (align?: string) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// Mirrors the exact DOM structure of your DataTable so the layout
// doesn't shift at all when real data arrives.

export const DataTableSkeleton = ({
  columns,
  rows = 8,
  selectable = false,
  minWidth = "600px",
  className = "",
}: DataTableSkeletonProps) => (
  <div
    className={`flex-1 overflow-auto border-t border-white/10 ${className}`}
    aria-busy="true"
    aria-label="Loading table data"
  >
    <table className="w-full border-collapse text-[13px]" style={{ minWidth }}>
      {/* ── Header ── mirrors the real thead exactly */}
      <thead>
        <tr>
          {selectable && (
            <th className="sticky top-0 z-10 border-b border-white/10 bg-[#12151b] px-3 py-3 text-left">
              {/* checkbox placeholder — same size, no shimmer (static) */}
              <div
                className="h-3.5 w-3.5 rounded-[4px] bg-white/[0.06]"
                aria-hidden="true"
              />
            </th>
          )}
          {columns.map((col) => (
            <th
              key={col.key}
              className="sticky top-0 z-10 border-b border-white/10 bg-[#12151b] px-3 py-3"
              style={{ minWidth: col.width }}
            >
              {/* header label shimmer — narrower than cell content */}
              <Shimmer className="h-2.5 w-[55%] rounded" />
            </th>
          ))}
        </tr>
      </thead>

      {/* ── Body ── each row alternates background to match the real rows */}
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr
            key={i}
            className={`border-b border-white/[0.06] ${
              i % 2 === 1 ? "bg-white/[0.015]" : ""
            }`}
          >
            {selectable && (
              <td className="px-3 py-3">
                <div
                  className="h-3.5 w-3.5 rounded-[4px] bg-white/[0.06]"
                  aria-hidden="true"
                />
              </td>
            )}
            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-3 py-3 ${alignClass(col.align)}`}
              >
                <div
                  className={`flex ${
                    col.align === "center" ? "justify-center" : "items-center"
                  }`}
                >
                  <SkeletonCell variant={col.skeletonVariant} />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* same keyframe your DataTable injects — shared, no duplication */}
    <style>{`
      @keyframes skeletonSweep {
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export default DataTableSkeleton;
