export const OrderType = {
    EMERGENCY: "Emergency",
    OVERDUE: "Overdue",
    DAILY: "Daily",
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const ORDER_PRIORITY: Record<OrderType, number> = {
    [OrderType.EMERGENCY]: 0,
    [OrderType.OVERDUE]: 1,
    [OrderType.DAILY]: 2,
};

export const OrderStatus = {
    IN_PROGRESS: "InProgress",
    SUCCESS: "Success",
    FAILED: "Failed",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderFailReason = {
    INSUFFICIENT_CREDIT: "InsufficientCredit",
    INSUFFICIENT_QUANTITY: "InsufficientQuantity",
} as const;

export type OrderFailReason = (typeof OrderFailReason)[keyof typeof OrderFailReason];