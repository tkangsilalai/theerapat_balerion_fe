import type { Order, OrderType } from "@/domain/order";

export function makeOrder(params: {
    customerId: string;
    salmonQuantity: number;
    supplierId?: string;
    warehouseId?: string;
    orderType: OrderType;
}): Order {
    return {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        customerId: params.customerId,
        salmonQuantity: params.salmonQuantity,
        supplierId: params.supplierId,
        warehouseId: params.warehouseId,
        orderType: params.orderType,
        status: "InProgress",
        allocations: [],
    };
}
