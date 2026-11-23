import { OrderStatus, OrderType } from "../../generated/prisma/enums";
export class OrderError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const bad = (message) => {
    throw new OrderError(400, message);
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
export const str = (v) => typeof v === "string" && v.trim() ? v.trim() : undefined;
function int(v, name, def, min, max) {
    if (v === undefined || v === "")
        return def;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max)
        bad(`${name} must be an integer between ${min} and ${max}`);
    return n;
}
function date(v, name) {
    if (v === undefined || v === "")
        return undefined;
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime()))
        bad(`${name} must be a valid date`);
    return d;
}
function oneOf(v, values, name) {
    if (v === undefined || v === "")
        return undefined;
    if (!values.includes(v))
        bad(`${name} must be one of: ${values.join(", ")}`);
    return v;
}
export function parseId(v) {
    if (typeof v !== "string" || !UUID.test(v))
        bad("Invalid order id");
    return v;
}
function list(v, values, name) {
    if (v === undefined || v === "")
        return undefined;
    const parts = (Array.isArray(v) ? v : [v])
        .flatMap((x) => String(x).split(","))
        .map((x) => x.trim())
        .filter(Boolean);
    const invalid = parts.filter((p) => !values.includes(p));
    if (invalid.length)
        bad(`${name} has invalid value(s): ${invalid.join(", ")}`);
    return parts.length ? parts : undefined;
}
function optionalId(v, name) {
    const id = str(v);
    if (id && !UUID.test(id))
        bad(`${name} must be a valid id`);
    return id;
}
export const SORT_FIELDS = [
    "createdAt",
    "businessDate",
    "totalPrice",
    "number",
];
export function parseListQuery(q) {
    const from = date(q.from, "from");
    const to = date(q.to, "to");
    if (from && to && from > to)
        bad("from must be before to");
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
        sortOrder: oneOf(q.sortOrder, ["asc", "desc"], "sortOrder") ?? "desc",
    };
}
// PUT: every editable key must be present (nullable ones accept null)
const EDITABLE = [
    "guests",
    "kitchenNotes",
    "customerNotes",
    "tableId",
    "driverId",
    "dueAt",
];
export function parseReplaceBody(body) {
    if (!isObject(body))
        return bad("Request body must be a JSON object");
    const b = body;
    const unknown = Object.keys(b).filter((k) => !EDITABLE.includes(k));
    if (unknown.length)
        bad(`Unknown fields: ${unknown.join(", ")}`);
    const missing = EDITABLE.filter((k) => !(k in b));
    if (missing.length)
        bad(`PUT requires all fields. Missing: ${missing.join(", ")}`);
    if (!Number.isInteger(b.guests) || b.guests < 1)
        bad("guests must be an integer >= 1");
    const note = (v, name) => {
        if (v === null)
            return null;
        if (typeof v !== "string" || v.length > 500)
            bad(`${name} must be a string (max 500) or null`);
        return v.trim();
    };
    const nullableId = (v, name, uuid) => {
        if (v === null)
            return null;
        if (typeof v !== "string" || !v || (uuid && !UUID.test(v)))
            bad(`${name} must be a valid id or null`);
        return v;
    };
    return {
        guests: b.guests,
        kitchenNotes: note(b.kitchenNotes, "kitchenNotes"),
        customerNotes: note(b.customerNotes, "customerNotes"),
        tableId: nullableId(b.tableId, "tableId", false),
        driverId: nullableId(b.driverId, "driverId", true),
        dueAt: b.dueAt === null
            ? null
            : (date(b.dueAt, "dueAt") ?? bad("dueAt must be a valid date or null")),
    };
}
export function parseStatusBody(body) {
    const status = isObject(body)
        ? oneOf(body.status, Object.values(OrderStatus), "status")
        : undefined;
    if (!status)
        bad(`status is required (${Object.values(OrderStatus).join(", ")})`);
    return status;
}
export function parseVoidBody(body) {
    const reason = isObject(body) ? str(body.reason) : undefined;
    if (!reason || reason.length < 3 || reason.length > 255)
        bad("reason is required (3-255 characters)");
    return reason;
}
