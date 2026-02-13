import type { OrderState } from "./order.reducer";

const KEY_PREFIX = "order_state_v1";

const keyFor = (customerId: string) => `${KEY_PREFIX}:${customerId?.trim().toUpperCase()}`;

export function loadState(customerId: string): OrderState | null {
    const raw = localStorage.getItem(keyFor(customerId));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as OrderState;
    } catch {
        return null;
    }
}

export function saveState(customerId: string, state: OrderState) {
    localStorage.setItem(keyFor(customerId), JSON.stringify(state));
}

export function clearState(customerId: string) {
    localStorage.removeItem(keyFor(customerId));
}