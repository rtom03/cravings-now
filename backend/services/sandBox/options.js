import { prisma } from "../../utils/db";
import foodicsClientSB from "../foodics/foodicsClientSB";
import { toSandboxModifierOptionPayload, } from "../foodicsSandbox/map/foodicsMapperOptions";
const createModifierOptionsSB = async (modifierSandboxId, payload) => {
    const { data } = await foodicsClientSB.post(`/modifiers/${modifierSandboxId}/options`, payload);
    return data.data;
};
export async function syncModifierOptionsForModifier(modifierSandboxId) {
    const options = await prisma.modifierOption.findMany({
        where: { foodicsSandBoxId: null },
    });
    const results = [];
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        // console.log(option);
        try {
            const payload = toSandboxModifierOptionPayload(option);
            const created = await createModifierOptionsSB(modifierSandboxId, payload);
            await prisma.modifierOption.update({
                where: { id: option.id },
                data: { foodicsSandBoxId: created.id },
            });
            results.push({
                dbOptionId: option.id,
                optionName: option.name,
                success: true,
                sandboxOptionId: created.id,
            });
        }
        catch (error) {
            // console.log(error);
            results.push({
                dbOptionId: option.id,
                optionName: option.name,
                success: false,
                error: error?.message || "Unknown error",
            });
        }
        // Heartbeat every 25 items — at 500+, a silent run can look identical
        // to a hung one; this just proves it's still moving.
        if ((i + 1) % 25 === 0) {
            console.log(`Progress: ${i + 1}/${options.length}`);
        }
    }
    const succeeded = results.filter((r) => r.success).length;
    console.log(`Modifier options: ${succeeded}/${results.length} synced.`);
    return results;
}
