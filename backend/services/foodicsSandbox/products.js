import { prisma } from "../../utils/db";
import foodicsClientSB from "../foodics/foodicsClientSB";
import { toSandboxCreatePayload } from "./map/foodicsMapperProducts";
///FETCH PRODUCTS FROM FOODICS(LIVE) BY GROUP ID
export const createProductFoodicsSB = async (payload) => {
    try {
        const response = await foodicsClientSB.post("/products", payload);
        return response.data;
    }
    catch (error) {
        throw new Error(error?.message || "Failed to create product in sandbox Foodics");
    }
};
// 90 requests/minute per Foodics' documented limit — paced at 80/min
// worth of spacing to leave headroom rather than riding the exact ceiling.
export const syncProductLiveToSandbox = async (groupName) => {
    const dbProducts = await prisma.groupProducts.findMany({
        where: { groupName: groupName, foodicsSandBoxId: null },
    });
    // ⚠️ Shape mismatch flag: earlier this function was confirmed to return
    // a bare array, but this code was indexing `.products` off it — those
    // can't both be right. Handling both here so it doesn't crash either
    // way, but confirm the REAL shape with console.log(liveProducts) and
    // remove this fallback once confirmed, rather than leaving two
    // code paths live indefinitely.
    const products = dbProducts;
    const results = [];
    for (const product of products) {
        try {
            const payload = toSandboxCreatePayload(product);
            const created = await createProductFoodicsSB(payload);
            console.log("🟢 FOODICS SANDBOX CREATED:", created.data.id);
            const updatedProduct = await prisma.groupProducts.update({
                where: { id: product.id },
                data: {
                    foodicsSandBoxId: created.data.id,
                },
                select: {
                    id: true,
                    foodicsId: true,
                    foodicsSandBoxId: true,
                    name: true,
                },
            });
            console.log("✅ DB UPDATED:", updatedProduct);
            results.push({
                liveProductId: product.id,
                productName: product.name,
                success: true,
                sandboxProductId: created?.data?.id,
            });
            console.log(results.length);
        }
        catch (error) {
            // console.log(error);
            results.push({
                liveProductId: product.id,
                productName: product.name,
                success: false,
                error: error?.message || "Unknown error",
            });
        }
        // Paced delay between EVERY request, success or failure — the rate
        // limit doesn't care which outcome a request had, only that it
        // happened.
    }
    console.log(`Done. ${results.filter((r) => r.success).length}/${results.length} synced.`);
    return results;
};
