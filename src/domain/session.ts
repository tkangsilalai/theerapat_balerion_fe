const KEY = "session_customer_id";

export function setSessionCustomerId(id: string) {
    localStorage.setItem(KEY, id);
}

export function getSessionCustomerId(): string | null {
    return localStorage.getItem(KEY);
}

export function clearSessionCustomerId() {
    localStorage.removeItem(KEY);
}
