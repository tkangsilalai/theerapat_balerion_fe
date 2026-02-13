import { OrderStatus, OrderType } from "@/domain/orderType";
import type { Order } from "@/domain/order";

export function generateOrders(n: number, customerId: string): Order[] {
    const now = Date.now();

    return Array.from({ length: n }, (_, i) => {
        const type =
            i % 3 === 0 ? OrderType.EMERGENCY : i % 3 === 1 ? OrderType.OVERDUE : OrderType.DAILY;

        return {
            id: crypto.randomUUID(),
            customerId,
            createdAt: now + i,
            orderType: type,
            salmonQuantity: 1,
            status: OrderStatus.IN_PROGRESS,
            allocations: [],
            failReason: undefined,
            totalPrice: undefined,
        };
    });
}
