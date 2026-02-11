import { findUserByCustomerId, type User } from "@/mock/users.ts";

const STORAGE_KEY = "session_customer_id";

export function isValidCustomerIdFormat(v: string): boolean {
    return /^CT-\d{4}$/.test(v.trim());
}

export function login(customerIdRaw: string): User {
    const customerId = customerIdRaw.trim().toUpperCase();

    if (!isValidCustomerIdFormat(customerId)) {
        throw new Error("Customer ID must match CT-XXXX (4 digits), e.g. CT-0001");
    }

    const user = findUserByCustomerId(customerId);
    if (!user) {
        throw new Error("Customer ID not found");
    }

    localStorage.setItem(STORAGE_KEY, customerId);
    return user;
}

export function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function getSessionCustomerId(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}
