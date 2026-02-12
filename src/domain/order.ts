import { OrderFailReason, OrderStatus, OrderType } from "./orderType";

export type OrderAllocation = {
    supplierId: string;
    warehouseId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

export type Order = {
    id: string;
    createdAt: number;
    customerId: string;

    // request
    salmonQuantity: number;
    supplierId?: string;
    warehouseId?: string;
    orderType: OrderType;

    status: OrderStatus;
    failReason?: OrderFailReason;

    // assigned
    allocations: OrderAllocation[];

    // totals
    totalQuantityAllocated?: number;
    totalPrice?: number;
};
