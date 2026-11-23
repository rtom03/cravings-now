import { OrderStatus, OrderType } from "../../generated/prisma/enums";

export class OrderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const bad = (message: string): never => {
  throw new OrderError(400, message);
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

function int(v: unknown, name: string, def: number, min: number, max: number) {
  if (v === undefined || v === "") return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max)
    bad(`${name} must be an integer between ${min} and ${max}`);
  return n;
}

function date(v: unknown, name: string): Date | undefined {
  if (v === undefined || v === "") return undefined;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) bad(`${name} must be a valid date`);
  return d;
}

function oneOf<T extends string>(
  v: unknown,
  values: readonly T[],
  name: string,
): T | undefined {
  if (v === undefined || v === "") return undefined;
  if (!values.includes(v as T))
    bad(`${name} must be one of: ${values.join(", ")}`);
  return v as T;
}

export function parseId(v: unknown): string {
  if (typeof v !== "string" || !UUID.test(v)) bad("Invalid order id");
  return v as string;
}

function list<T extends string>(
  v: unknown,
  values: readonly T[],
  name: string,
): T[] | undefined {
  if (v === undefined || v === "") return undefined;
  const parts = (Array.isArray(v) ? v : [v])
    .flatMap((x) => String(x).split(","))
    .map((x) => x.trim())
    .filter(Boolean);
  const invalid = parts.filter((p) => !values.includes(p as T));
  if (invalid.length)
    bad(`${name} has invalid value(s): ${invalid.join(", ")}`);
  return parts.length ? (parts as T[]) : undefined;
}

function optionalId(v: unknown, name: string) {
  const id = str(v);
  if (id && !UUID.test(id)) bad(`${name} must be a valid id`);
  return id;
}

export const SORT_FIELDS = [
  "createdAt",
  "businessDate",
  "totalPrice",
  "number",
] as const;

export function parseListQuery(q: Record<string, unknown>) {
  const from = date(q.from, "from");
  const to = date(q.to, "to");
  if (from && to && from > to) bad("from must be before to");

  return {
    page: int(q.page, "page", 1, 1, 1_000_000),
    limit: int(q.limit, "limit", 20, 1, 100),
    status: list(q.status, Object.values(OrderStatus), "status"),
    type: list(q.type, Object.values(OrderType), "type"),
    branchId: optionalId(q.branchId, "branchId"), // honoured for all-branch roles only
    groupName: str(q.groupName),
    customerId: optionalId(q.customerId, "customerId"),
    from,
    to,
    search: str(q.search),
    sortBy: oneOf(q.sortBy, SORT_FIELDS, "sortBy") ?? "createdAt",
    sortOrder:
      oneOf(q.sortOrder, ["asc", "desc"] as const, "sortOrder") ?? "desc",
  };
}

export type ListOrdersQuery = ReturnType<typeof parseListQuery>;

// PUT: every editable key must be present (nullable ones accept null)
const EDITABLE = [
  "guests",
  "kitchenNotes",
  "customerNotes",
  "tableId",
  "driverId",
  "dueAt",
];

export function parseReplaceBody(body: unknown) {
  if (!isObject(body)) return bad("Request body must be a JSON object");
  const b = body as Record<string, unknown>;

  const unknown = Object.keys(b).filter((k) => !EDITABLE.includes(k));
  if (unknown.length) bad(`Unknown fields: ${unknown.join(", ")}`);
  const missing = EDITABLE.filter((k) => !(k in b));
  if (missing.length)
    bad(`PUT requires all fields. Missing: ${missing.join(", ")}`);

  if (!Number.isInteger(b.guests) || (b.guests as number) < 1)
    bad("guests must be an integer >= 1");

  const note = (v: unknown, name: string) => {
    if (v === null) return null;
    if (typeof v !== "string" || v.length > 500)
      bad(`${name} must be a string (max 500) or null`);
    return (v as string).trim();
  };

  const nullableId = (v: unknown, name: string, uuid: boolean) => {
    if (v === null) return null;
    if (typeof v !== "string" || !v || (uuid && !UUID.test(v)))
      bad(`${name} must be a valid id or null`);
    return v as string;
  };

  return {
    guests: b.guests as number,
    kitchenNotes: note(b.kitchenNotes, "kitchenNotes"),
    customerNotes: note(b.customerNotes, "customerNotes"),
    tableId: nullableId(b.tableId, "tableId", false),
    driverId: nullableId(b.driverId, "driverId", true),
    dueAt:
      b.dueAt === null
        ? null
        : (date(b.dueAt, "dueAt") ?? bad("dueAt must be a valid date or null")),
  };
}

export type ReplaceOrderBody = ReturnType<typeof parseReplaceBody>;

export function parseStatusBody(body: unknown): OrderStatus {
  const status = isObject(body)
    ? oneOf(body.status, Object.values(OrderStatus), "status")
    : undefined;
  if (!status)
    bad(`status is required (${Object.values(OrderStatus).join(", ")})`);
  return status as OrderStatus;
}

export function parseVoidBody(body: unknown): string {
  const reason = isObject(body) ? str(body.reason) : undefined;
  if (!reason || reason.length < 3 || reason.length > 255)
    bad("reason is required (3-255 characters)");
  return reason as string;
}
