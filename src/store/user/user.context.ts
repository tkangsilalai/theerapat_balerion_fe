import { createContext } from "react";

export type UserState = {
    customerId: string | null;
    userCredit: number;
    setCustomerId: (id: string | null) => void;
    setUserCredit: (credit: number) => void;
    login: (id: string) => void;
    logout: () => void;
};

export const UserContext = createContext<UserState | null>(null);
