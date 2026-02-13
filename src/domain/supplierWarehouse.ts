import { OrderType } from "./orderType";

export type WarehouseStock = {
    supplierId: string;
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
        priceMultiplierByType: { [OrderType.EMERGENCY]: 1.25, [OrderType.DAILY]: 1.0, [OrderType.OVERDUE]: 0.9 },
        warehouses: [
            { supplierId: "SP-0001", warehouseId: "WH-0001", quantityOfSalmonLeft: 5000, basePricePerUnit: 12.5 },
            { supplierId: "SP-0001", warehouseId: "WH-0002", quantityOfSalmonLeft: 1200, basePricePerUnit: 12.2 },
        ],
    },
    {
        supplierId: "SP-0002",
        priceMultiplierByType: { [OrderType.EMERGENCY]: 1.3, [OrderType.DAILY]: 1.0, [OrderType.OVERDUE]: 0.92 },
        warehouses: [
            { supplierId: "SP-0002", warehouseId: "WH-0001", quantityOfSalmonLeft: 9000, basePricePerUnit: 12.8 },
            { supplierId: "SP-0002", warehouseId: "WH-0003", quantityOfSalmonLeft: 400, basePricePerUnit: 12.0 },
        ],
    },
    {
        supplierId: "SP-0003",
        priceMultiplierByType: { [OrderType.EMERGENCY]: 1.2, [OrderType.DAILY]: 1.0, [OrderType.OVERDUE]: 0.88 },
        warehouses: [{ supplierId: "SP-0003", warehouseId: "WH-0002", quantityOfSalmonLeft: 3000, basePricePerUnit: 11.9 }],
    },
];

function listSuppliers(): Supplier[] {
    return MOCK_SUPPLIERS;
}

export function unitPriceFor(
    supplier: Supplier,
    warehouse: WarehouseStock,
    orderType: OrderType,
): number {
    const m = supplier.priceMultiplierByType[orderType];
    return warehouse.basePricePerUnit * m;
}

export function getAvailableSalmonLeftForScope(
    inventory: WarehouseStock[],
    supplierId?: string,
    warehouseId?: string
): number {
    if (!supplierId) {
        return inventory.reduce((sum, w) => sum + w.quantityOfSalmonLeft, 0);
    }

    if (!warehouseId) {
        return inventory
            .filter((w) => w.supplierId === supplierId)
            .reduce((sum, w) => sum + w.quantityOfSalmonLeft, 0);
    }

    const warehouse = inventory.find(
        (w) =>
            w.supplierId === supplierId &&
            w.warehouseId === warehouseId
    );

    return warehouse?.quantityOfSalmonLeft ?? 0;
}


export function buildInitialInventoryFromMock(): WarehouseStock[] {
    const inventory: WarehouseStock[] = [];
    for (const supplier of MOCK_SUPPLIERS) {
        for (const warehouse of supplier.warehouses) {
            inventory.push({ ...warehouse });
        }
    }
    return inventory;
}

export function listSupplierWarehousesFromInventory(
    supplierId: string,
    inventory: WarehouseStock[],
): WarehouseStock[] {
    const sid = supplierId.trim().toUpperCase();
    return inventory.filter((w) => w.supplierId === sid);
}

export function findWarehouseInInventory(
    supplierId: string,
    warehouseId: string,
    inventory: WarehouseStock[],
): WarehouseStock | null {
    const sid = supplierId.trim().toUpperCase();
    const wid = warehouseId.trim().toUpperCase();
    return inventory.find((w) => w.supplierId === sid && w.warehouseId === wid) ?? null;
}

export type SupplierWithTotals = Supplier & {
    totalSalmonLeft: number;
};

export function listSuppliersFromInventory(
    inventory: WarehouseStock[],
): SupplierWithTotals[] {
    const ids = listSuppliers().map((s) => s.supplierId);

    return ids.map((supplierId) => {
        const meta = MOCK_SUPPLIERS.find((s) => s.supplierId === supplierId);
        const warehouses = inventory.filter((w) => w.supplierId === supplierId);
        const totalSalmonLeft = warehouses.reduce((sum, w) => sum + w.quantityOfSalmonLeft, 0);

        return {
            supplierId,
            priceMultiplierByType: meta?.priceMultiplierByType ?? {
                Emergency: 1,
                Daily: 1,
                Overdue: 1,
            },
            warehouses,
            totalSalmonLeft,
        };
    });
}


export function findSupplierFromInventory(
    supplierId: string,
    inventory: WarehouseStock[],
): Supplier | null {
    const warehouses = inventory.filter((w) => w.supplierId === supplierId);
    if (warehouses.length === 0) return null;

    const meta = MOCK_SUPPLIERS.find((s) => s.supplierId === supplierId);

    return {
        supplierId: supplierId,
        priceMultiplierByType: meta?.priceMultiplierByType ?? {
            Emergency: 1,
            Daily: 1,
            Overdue: 1,
        },
        warehouses,
    };
}