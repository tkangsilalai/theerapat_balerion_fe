function roundBankers(value: number, decimals = 2): number {
    // Scale the value to avoid floating point issues
    const scaled = Math.round(value * 1000) / 1000;

    const factor = Math.pow(10, decimals);
    const n = scaled * factor;
    const r = Math.floor(n);
    const diff = n - r;

    // Flooding point precision epsilon
    const eps = 1e-10;
    if (Math.abs(diff - 0.5) < eps) {
        return (r % 2 === 0 ? r : r + 1) / factor;
    }

    return Math.round(n) / factor;
}

export function formatCredit(x: number): string {
    const s = roundBankers(x, 2).toFixed(2);
    return s === "-0.00" ? "0.00" : s;
}

export function shortId(id: string) {
    return id.slice(0, 8);
}
