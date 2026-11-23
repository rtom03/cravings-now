import { apiFetch } from "@/lib/apiFetch"; // adjust path
// ---- Helpers ----
const toQuery = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "")
            return;
        qs.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    const s = qs.toString();
    return s ? `?${s}` : "";
};
const json = { "Content-Type": "application/json" };
// ---- Service ----
const listOrders = async (params = {}) => {
    return apiFetch(`/orders${toQuery(params)}`);
};
const getOrder = async (id) => {
    return apiFetch(`/orders/${id}`);
};
const updateOrder = async (id, data) => {
    return apiFetch(`/orders/${id}`, {
        method: "PUT",
        headers: json,
        body: JSON.stringify(data),
    });
};
const updateOrderStatus = async (id, status) => {
    return apiFetch(`/orders/${id}/status`, {
        method: "PATCH",
        headers: json,
        body: JSON.stringify({ status }),
    });
};
const voidOrder = async (id, reason) => {
    return apiFetch(`/orders/${id}/void`, {
        method: "PATCH",
        headers: json,
        body: JSON.stringify({ reason }),
    });
};
export const orderService = {
    listOrders,
    getOrder,
    updateOrder,
    updateOrderStatus,
    voidOrder,
};
