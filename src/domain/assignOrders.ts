import { pickAllocations, sumAllocTotal } from "./assignOrdersHelper";
import type { Order } from "./order";
import { ORDER_PRIORITY, OrderFailReason, OrderStatus } from "./orderType";
import type { WarehouseStock } from "./supplierWarehouse";

function sortOrdersForAssignment(a: Order, b: Order) {
    const pa = ORDER_PRIORITY[a.orderType];
    const pb = ORDER_PRIORITY[b.orderType];
    if (pa !== pb) return pa - pb;
    // FIFO
    return a.createdAt - b.createdAt;
}

export function assignOrders(params: {
    orders: Order[];
    inventory: WarehouseStock[];
    userCredit: number;
}): { orders: Order[]; inventory: WarehouseStock[]; userCredit: number } {
    let { userCredit } = params;
    const inventory = params.inventory.map((x) => ({ ...x })); // copy
    const orders = params.orders.map((o) => ({ ...o, allocations: o.allocations ?? [] }));

    const inProgress = orders
        .filter((o) => o.status === "InProgress")
        .slice()
        .sort(sortOrdersForAssignment);

    for (const o of inProgress) {
        // compute allocations without committing
        const { allocations, totalAvailable } = pickAllocations(o, inventory);

        if (totalAvailable < o.salmonQuantity) {
            o.status = OrderStatus.FAILED;
            o.failReason = OrderFailReason.INSUFFICIENT_QUANTITY;
            o.allocations = [];
            o.totalPrice = undefined;
            continue;
        }

        const allocatedQty = allocations.reduce((sum, a) => sum + a.quantity, 0);
        if (allocatedQty !== o.salmonQuantity) {
            o.status = OrderStatus.FAILED;
            o.failReason = OrderFailReason.INSUFFICIENT_QUANTITY;
            o.allocations = [];
            o.totalPrice = undefined;
            continue;
        }

        const totalPrice = sumAllocTotal(allocations);

        if (userCredit < totalPrice) {
            o.status = OrderStatus.FAILED;
            o.failReason = OrderFailReason.INSUFFICIENT_CREDIT;
            o.allocations = [];
            o.totalPrice = undefined;
            continue;
        }

        for (const a of allocations) {
            const idx = inventory.findIndex(
                (w) => w.supplierId === a.supplierId && w.warehouseId === a.warehouseId,
            );
            if (idx >= 0) inventory[idx] = { ...inventory[idx], quantityOfSalmonLeft: inventory[idx].quantityOfSalmonLeft - a.quantity };
        }

        userCredit = userCredit - totalPrice;

        o.status = OrderStatus.SUCCESS;
        o.failReason = undefined;
        o.allocations = allocations;
        o.totalPrice = totalPrice;
    }

    return { orders, inventory, userCredit };
}

