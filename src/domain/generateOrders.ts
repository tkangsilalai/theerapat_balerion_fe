import { OrderStatus, OrderType } from "@/domain/orderType";
import type { Order } from "@/domain/order";

export function generateOrders(n: number, customerId: string, type: OrderType, quantity: number, supplierId?: string, warehouseId?: string): Order[] {
    const now = Date.now();

    return Array.from({ length: n }, (_, i) => {

        return {
            id: crypto.randomUUID(),
            customerId,
            createdAt: now + i,
            orderType: type,
            salmonQuantity: quantity,
            status: OrderStatus.IN_PROGRESS,
            allocations: [],
            failReason: undefined,
            totalPrice: undefined,
            supplierId: supplierId,
            warehouseId: warehouseId,
        };
    });
}
