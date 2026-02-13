import { createContext } from "react";
import type { Dispatch } from "react";
import type { OrderState, OrderAction } from "./order.reducer";

export type OrderContextValue = {
    state: OrderState;
    dispatch: Dispatch<OrderAction>;
};

export const OrderContext = createContext<OrderContextValue | null>(null);
