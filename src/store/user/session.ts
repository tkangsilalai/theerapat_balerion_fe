const CUSTOMER_KEY = "session_customer_id_v1";
const CREDIT_KEY = "session_user_credit_v1";

// Customer ID
export function setSessionCustomerId(id: string) {
    localStorage.setItem(CUSTOMER_KEY, id);
}
export function getSessionCustomerId(): string | null {
    return localStorage.getItem(CUSTOMER_KEY);
}
export function clearSessionCustomerId() {
    localStorage.removeItem(CUSTOMER_KEY);
}

// User Credit
export function setSessionUserCredit(credit: number) {
    localStorage.setItem(CREDIT_KEY, String(credit));
}
export function getSessionUserCredit(): number | null {
    const v = localStorage.getItem(CREDIT_KEY);
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}
export function clearSessionUserCredit() {
    localStorage.removeItem(CREDIT_KEY);
}

// Clear all session user data
export function clearSessionUser() {
    clearSessionCustomerId();
    clearSessionUserCredit();
}
