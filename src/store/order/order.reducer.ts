import type { Order } from "@/domain/order";
import type { WarehouseStock } from "@/domain/supplierWarehouse";

export type OrderState = {
    orders: Order[];
    inventory: WarehouseStock[];
};

export const OrderActionType = {
    ORDER_CREATED: "ORDER_CREATED",
    ORDERS_ASSIGNED: "ORDERS_ASSIGNED",
} as const;

export type OrderActionType = (typeof OrderActionType)[keyof typeof OrderActionType];

export type OrderAction =
    | { type: "ORDER_CREATED"; order: Order }
    | { type: "ORDERS_ASSIGNED"; orders: Order[]; inventory: WarehouseStock[] };

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
    switch (action.type) {
        case "ORDER_CREATED":
            return { ...state, orders: [action.order, ...state.orders] };

        case "ORDERS_ASSIGNED":
            return { ...state, orders: action.orders, inventory: action.inventory };

        default:
            return state;
    }
}
