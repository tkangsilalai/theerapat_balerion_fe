import type { Order, OrderAllocation } from "./order";
import { findSupplier, type WarehouseStock } from "./supplierWarehouse";

function getCandidates(order: Order, inventory: WarehouseStock[]): WarehouseStock[] {
    return inventory.filter((w) => {
        if (order.supplierId && w.supplierId !== order.supplierId) return false;
        if (order.warehouseId && w.warehouseId !== order.warehouseId) return false;
        return true;
    });
}

export function pickAllocations(
    order: Order,
    inventory: WarehouseStock[],
): { allocations: OrderAllocation[]; totalAvailable: number } {
    const candidates = getCandidates(order, inventory).slice();

    // highest stock first
    candidates.sort((a, b) => b.quantityOfSalmonLeft - a.quantityOfSalmonLeft);

    let remaining = order.salmonQuantity;
    const allocations: OrderAllocation[] = [];

    const totalAvailable = candidates.reduce((sum, w) => sum + w.quantityOfSalmonLeft, 0);

    for (const w of candidates) {
        if (remaining <= 0) break;
        if (w.quantityOfSalmonLeft <= 0) continue;

        const take = Math.min(remaining, w.quantityOfSalmonLeft);
        if (take <= 0) continue;

        const supplier = findSupplier(w.supplierId);
        if (!supplier) continue;

        const unitPrice = w.basePricePerUnit * supplier.priceMultiplierByType[order.orderType];
        const totalPrice = unitPrice * take;

        allocations.push({
            supplierId: w.supplierId,
            warehouseId: w.warehouseId,
            quantity: take,
            unitPrice,
            totalPrice,
        });

        remaining -= take;
    }

    return { allocations, totalAvailable };
}

export function sumAllocTotal(allocations: OrderAllocation[]) {
    return allocations.reduce((sum, a) => sum + a.totalPrice, 0);
}