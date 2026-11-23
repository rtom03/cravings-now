export function calculateProcessingFeeKobo(charge, subtotalKobo) {
    const rate = charge.value / 100;
    const flatAddOnKobo = Math.round((charge.flatAddOn ?? 0) * 100);
    const capKobo = charge.capAmount != null ? Math.round(charge.capAmount * 100) : null;
    const minKobo = charge.minAmount != null ? Math.round(charge.minAmount * 100) : null;
    if (charge.calculation === "Fixed") {
        return Math.round(charge.value * 100);
    }
    let feeKobo;
    if (minKobo != null && subtotalKobo <= minKobo) {
        feeKobo = Math.ceil((subtotalKobo * rate) / (1 - rate));
    }
    else {
        feeKobo = Math.ceil((subtotalKobo * rate + flatAddOnKobo) / (1 - rate));
    }
    return capKobo != null ? Math.min(feeKobo, capKobo) : feeKobo;
}
