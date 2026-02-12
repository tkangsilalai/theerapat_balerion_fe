import type { Order } from "@/domain/order";
import type { WarehouseStock } from "@/domain/supplierWarehouse";

export type OrderState = {
    orders: Order[];
    inventory: WarehouseStock[];
};

export const OrderActionType = {
    ORDER_CREATED: "ORDER_CREATED",
    ORDERS_ASSIGNED: "ORDERS_ASSIGNED",
    ORDER_DELETED: "ORDER_DELETED",
} as const;

export type OrderActionType = (typeof OrderActionType)[keyof typeof OrderActionType];

export type OrderAction =
    | { type: "ORDER_CREATED"; order: Order }
    | { type: "ORDERS_ASSIGNED"; orders: Order[]; inventory: WarehouseStock[] }
    | { type: "ORDER_DELETED"; orderId: Order["id"] };

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
    switch (action.type) {
        case "ORDER_CREATED":
            return { ...state, orders: [action.order, ...state.orders] };

        case "ORDERS_ASSIGNED":
            return { ...state, orders: action.orders, inventory: action.inventory };

        case "ORDER_DELETED":
            return { ...state, orders: state.orders.filter((o) => o.id !== action.orderId) };

        default:
            return state;
    }
}
