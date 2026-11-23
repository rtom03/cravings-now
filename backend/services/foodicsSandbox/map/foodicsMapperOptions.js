function toSandboxModifierOptionPayload(option) {
    return {
        name: option.name,
        name_localized: option.nameLocalized,
        costing_method: option.costingMethod,
        price: option.price,
        sku: option.sku,
        is_active: option.isActive,
    };
}
export { toSandboxModifierOptionPayload, };
