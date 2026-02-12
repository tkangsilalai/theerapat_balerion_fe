export type OrderType = "Emergency" | "Overdue" | "Daily";

export type WarehouseStock = {
    warehouseId: string;
    quantityOfSalmonLeft: number;
    basePricePerUnit: number;
};

export type Supplier = {
    supplierId: string;
    priceMultiplierByType: Record<OrderType, number>;
    warehouses: WarehouseStock[];
};

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        supplierId: "SP-0001",
        priceMultiplierByType: { Emergency: 1.25, Daily: 1.0, Overdue: 0.9 },
        warehouses: [
            { warehouseId: "WH-0001", quantityOfSalmonLeft: 5000, basePricePerUnit: 12.5 },
            { warehouseId: "WH-0002", quantityOfSalmonLeft: 1200, basePricePerUnit: 12.2 },
        ],
    },
    {
        supplierId: "SP-0002",
        priceMultiplierByType: { Emergency: 1.3, Daily: 1.0, Overdue: 0.92 },
        warehouses: [
            { warehouseId: "WH-0001", quantityOfSalmonLeft: 9000, basePricePerUnit: 12.8 },
            { warehouseId: "WH-0003", quantityOfSalmonLeft: 400, basePricePerUnit: 12.0 },
        ],
    },
    {
        supplierId: "SP-0003",
        priceMultiplierByType: { Emergency: 1.2, Daily: 1.0, Overdue: 0.88 },
        warehouses: [{ warehouseId: "WH-0002", quantityOfSalmonLeft: 3000, basePricePerUnit: 11.9 }],
    },
];

export function listSuppliers(): Supplier[] {
    return MOCK_SUPPLIERS;
}

export function findSupplier(supplierId: string): Supplier | null {
    const id = supplierId.trim().toUpperCase();
    return MOCK_SUPPLIERS.find((s) => s.supplierId === id) ?? null;
}

export function listSupplierWarehouses(supplierId: string): WarehouseStock[] | null {
    const s = findSupplier(supplierId);
    if (!s) return null;
    return s.warehouses;
}

export function findWarehouseInSupplier(
    supplierId: string,
    warehouseId: string,
): WarehouseStock | null {
    const s = findSupplier(supplierId);
    if (!s) return null;
    const wid = warehouseId.trim().toUpperCase();
    return s.warehouses.find((w) => w.warehouseId === wid) ?? null;
}

export function unitPriceFor(
    supplier: Supplier,
    warehouse: WarehouseStock,
    orderType: OrderType,
): number {
    const m = supplier.priceMultiplierByType[orderType];
    return warehouse.basePricePerUnit * m;
}

function getTotalSalmonLeft(): number {
    return listSuppliers().reduce((sum, s) => {
        return (
            sum +
            s.warehouses.reduce((ws, w) => ws + w.quantityOfSalmonLeft, 0)
        );
    }, 0);
}

export function getAvailableSalmonLeftForScope(
    supplierId?: string,
    warehouseId?: string
): number {
    if (!supplierId) {
        return getTotalSalmonLeft();
    }

    const supplier = findSupplier(supplierId);
    if (!supplier) return 0;

    if (!warehouseId) {
        return supplier.warehouses.reduce(
            (sum, w) => sum + w.quantityOfSalmonLeft,
            0
        );
    }

    const warehouse = supplier.warehouses.find(
        (w) => w.warehouseId === warehouseId
    );

    return warehouse?.quantityOfSalmonLeft ?? 0;
}
