import type { OrderState } from "./order.reducer";

const STORAGE_KEY = "order_state";

export function loadState(): OrderState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function saveState(state: OrderState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
