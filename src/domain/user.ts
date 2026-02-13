export type User = {
    customerId: string;
    credit: number;
};

export const MOCK_USERS_BY_ID: Record<string, User> = {
    "CT-0001": { customerId: "CT-0001", credit: 2500.0 },
    "CT-0002": { customerId: "CT-0002", credit: 120.55 },
    "CT-0100": { customerId: "CT-0100", credit: 9999.99 },
    "CT-0112": { customerId: "CT-0112", credit: 9999999999.99 },
};

export function findUserByCustomerId(customerId: string): User | null {
    return MOCK_USERS_BY_ID[customerId] ?? null;
}

export function listUsers(): User[] {
    return Object.values(MOCK_USERS_BY_ID);
}