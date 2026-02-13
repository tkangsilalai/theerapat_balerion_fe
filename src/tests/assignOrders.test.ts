/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    type Order,
    type OrderAllocation,
} from "@/domain/order";
import type { WarehouseStock } from "@/domain/supplierWarehouse";
import * as orderAllocationModule from "@/domain/assignOrdersHelper";
import { OrderFailReason, OrderStatus, OrderType } from "@/domain/orderType";
import { assignOrders } from "@/domain/assignOrders";

describe("assignOrders()", () => {
    let pickAllocationsSpy: ReturnType<typeof vi.spyOn>;
    let sumAllocTotalSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.restoreAllMocks(); // important to fully reset spies between tests
        pickAllocationsSpy = vi.spyOn(orderAllocationModule, "pickAllocations");
        sumAllocTotalSpy = vi.spyOn(orderAllocationModule, "sumAllocTotal");
    });

    it("fails with INSUFFICIENT_QUANTITY if totalAvailable < salmonQuantity", () => {
        const orders: Order[] = [{
            id: "B",
            status: OrderStatus.IN_PROGRESS,
            salmonQuantity: 10,
            createdAt: 0,
            customerId: "",
            orderType: OrderType.EMERGENCY,
            allocations: []
        }];
        const inventory: WarehouseStock[] = [{
            supplierId: "S1",
            warehouseId: "W1",
            quantityOfSalmonLeft: 9,
            basePricePerUnit: 0
        }];
        const userCredit = 999;

        pickAllocationsSpy.mockReturnValue({
            allocations: [{ supplierId: "S1", warehouseId: "W1", quantity: 9 }],
            totalAvailable: 9,
        } as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        const o = out.orders[0];
        expect(o.status).toBe(OrderStatus.FAILED);
        expect(o.failReason).toBe(OrderFailReason.INSUFFICIENT_QUANTITY);
        expect(o.allocations).toEqual([]);
        expect(o.totalPrice).toBeUndefined();

        expect(out.inventory[0].quantityOfSalmonLeft).toBe(9);
        expect(out.userCredit).toBe(999);
    });

    it("fails with INSUFFICIENT_QUANTITY if allocations sum != salmonQuantity", () => {
        const orders: Order[] = [{
            id: "B",
            status: OrderStatus.IN_PROGRESS, salmonQuantity: 10,
            createdAt: 0,
            customerId: "",
            orderType: OrderType.EMERGENCY,
            allocations: []
        }];
        const inventory: WarehouseStock[] = [{
            supplierId: "S1",
            warehouseId: "W1",
            quantityOfSalmonLeft: 100,
            basePricePerUnit: 0
        }];
        const userCredit = 999;

        pickAllocationsSpy.mockReturnValue({
            allocations: [
                { supplierId: "S1", warehouseId: "W1", quantity: 6 },
                { supplierId: "S2", warehouseId: "W2", quantity: 3 }, // total 9 != 10
            ],
            totalAvailable: 100,
        } as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        const o = out.orders[0];
        expect(o.status).toBe(OrderStatus.FAILED);
        expect(o.failReason).toBe(OrderFailReason.INSUFFICIENT_QUANTITY);
        expect(o.allocations).toEqual([]);
        expect(o.totalPrice).toBeUndefined();

        expect(out.userCredit).toBe(999);
    });

    it("fails with INSUFFICIENT_CREDIT if userCredit < totalPrice", () => {
        const orders: Order[] = [{
            id: "B", status: OrderStatus.IN_PROGRESS, salmonQuantity: 10,
            createdAt: 0,
            customerId: "",
            orderType: OrderType.EMERGENCY,
            allocations: []
        }];
        const inventory: WarehouseStock[] = [
            {
                supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 100,
                basePricePerUnit: 0
            },
            {
                supplierId: "S2", warehouseId: "W2", quantityOfSalmonLeft: 100,
                basePricePerUnit: 0
            },
        ];
        const userCredit = 49;

        pickAllocationsSpy.mockReturnValue({
            allocations: [
                { supplierId: "S1", warehouseId: "W1", quantity: 5 },
                { supplierId: "S2", warehouseId: "W2", quantity: 5 },
            ],
            totalAvailable: 200,
        } as any);

        sumAllocTotalSpy.mockReturnValue(50 as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        const o = out.orders[0];
        expect(o.status).toBe(OrderStatus.FAILED);
        expect(o.failReason).toBe(OrderFailReason.INSUFFICIENT_CREDIT);
        expect(o.allocations).toEqual([]);
        expect(o.totalPrice).toBeUndefined();

        // inventory unchanged
        expect(out.inventory.find((x) => x.supplierId === "S1")!.quantityOfSalmonLeft).toBe(100);
        expect(out.inventory.find((x) => x.supplierId === "S2")!.quantityOfSalmonLeft).toBe(100);
        expect(out.userCredit).toBe(49);
    });

    it("SUCCESS: commits inventory decrements and reduces userCredit; sets allocations and totalPrice", () => {
        const orders: Order[] = [{
            id: "B", status: OrderStatus.IN_PROGRESS, salmonQuantity: 10,
            createdAt: 0,
            customerId: "",
            orderType: OrderType.EMERGENCY,
            allocations: []
        }];
        const inventory: WarehouseStock[] = [
            {
                supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 7,
                basePricePerUnit: 0
            },
            {
                supplierId: "S2", warehouseId: "W2", quantityOfSalmonLeft: 9,
                basePricePerUnit: 0
            },
        ];
        const userCredit = 100;

        pickAllocationsSpy.mockReturnValue({
            allocations: [
                { supplierId: "S1", warehouseId: "W1", quantity: 6 },
                { supplierId: "S2", warehouseId: "W2", quantity: 4 },
            ],
            totalAvailable: 999,
        } as any);

        sumAllocTotalSpy.mockReturnValue(60 as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        const o = out.orders[0];
        expect(o.status).toBe(OrderStatus.SUCCESS);
        expect(o.failReason).toBeUndefined();
        expect(o.totalPrice).toBe(60);
        expect(o.allocations).toEqual([
            { supplierId: "S1", warehouseId: "W1", quantity: 6 },
            { supplierId: "S2", warehouseId: "W2", quantity: 4 },
        ]);

        expect(out.userCredit).toBe(40);
        expect(out.inventory.find((x) => x.supplierId === "S1" && x.warehouseId === "W1")!.quantityOfSalmonLeft).toBe(1);
        expect(out.inventory.find((x) => x.supplierId === "S2" && x.warehouseId === "W2")!.quantityOfSalmonLeft).toBe(5);
    });

    it("does not mutate input orders/inventory (works on copies)", () => {
        const orders: Order[] = [{
            id: "B", status: OrderStatus.IN_PROGRESS, salmonQuantity: 2, allocations: [],
            createdAt: 0,
            customerId: "",
            orderType: OrderType.EMERGENCY
        }];
        const inventory: WarehouseStock[] = [{
            supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 2,
            basePricePerUnit: 0
        }];
        const userCredit = 10;

        pickAllocationsSpy.mockReturnValue({
            allocations: [{ supplierId: "S1", warehouseId: "W1", quantity: 2 }],
            totalAvailable: 2,
        } as any);

        sumAllocTotalSpy.mockReturnValue(10 as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        // output changed
        expect(out.orders[0].status).toBe(OrderStatus.SUCCESS);
        expect(out.inventory[0].quantityOfSalmonLeft).toBe(0);

        // input unchanged
        expect(orders[0].status).toBe(OrderStatus.IN_PROGRESS);
        expect(orders[0].totalPrice).toBeUndefined();
        expect(inventory[0].quantityOfSalmonLeft).toBe(2);
    });

    it("multiple orders: credit reduction affects later orders", () => {
        const orders: Order[] = [
            {
                id: "O1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1,
                createdAt: 0,
                customerId: "",
                orderType: OrderType.EMERGENCY,
                allocations: []
            },
            {
                id: "O2", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1,
                createdAt: 0,
                customerId: "",
                orderType: OrderType.EMERGENCY,
                allocations: []
            },
        ];
        const inventory: WarehouseStock[] = [{
            supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 2,
            basePricePerUnit: 0
        }];
        const userCredit = 15;

        pickAllocationsSpy.mockImplementation(() => ({
            allocations: [{ supplierId: "S1", warehouseId: "W1", quantity: 1 }],
            totalAvailable: 2,
        }) as any);

        sumAllocTotalSpy.mockReturnValue(10 as any);

        const out = assignOrders({ orders: orders as any, inventory: inventory as any, userCredit });

        const o1 = out.orders.find((x) => x.id === "O1")!;
        const o2 = out.orders.find((x) => x.id === "O2")!;

        expect(o1.status).toBe(OrderStatus.SUCCESS);
        expect(o2.status).toBe(OrderStatus.FAILED);
        expect(o2.failReason).toBe(OrderFailReason.INSUFFICIENT_CREDIT);

        expect(out.inventory[0].quantityOfSalmonLeft).toBe(1);
        expect(out.userCredit).toBe(5);
    });

    it("sorts InProgress orders by priority: EMERGENCY -> OVERDUE -> DAILY", () => {
        const orders: Order[] = [
            { id: "D1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 300, customerId: "", orderType: OrderType.DAILY, allocations: [] },
            { id: "E1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 200, customerId: "", orderType: OrderType.EMERGENCY, allocations: [] },
            { id: "O1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 100, customerId: "", orderType: OrderType.OVERDUE, allocations: [] },
        ];

        const inventory: WarehouseStock[] = [{ supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 10, basePricePerUnit: 0 }];
        const userCredit = 999;

        const callOrder: string[] = [];

        pickAllocationsSpy.mockImplementation((order: Order,): { allocations: OrderAllocation[]; totalAvailable: number } => {
            callOrder.push(order.id);
            return {
                allocations: [{
                    supplierId: "S1", warehouseId: "W1", quantity: order.salmonQuantity,
                    unitPrice: 0,
                    totalPrice: 0
                }],
                totalAvailable: 999,
            };
        });

        sumAllocTotalSpy.mockReturnValue(1 as any);

        const out = assignOrders({ orders, inventory, userCredit });

        // ✅ must process in priority order, not the input order
        expect(callOrder).toEqual(["E1", "O1", "D1"]);

        // sanity: all succeeded
        expect(out.orders.find((x) => x.id === "E1")!.status).toBe(OrderStatus.SUCCESS);
        expect(out.orders.find((x) => x.id === "O1")!.status).toBe(OrderStatus.SUCCESS);
        expect(out.orders.find((x) => x.id === "D1")!.status).toBe(OrderStatus.SUCCESS);
    });

    it("sorts FIFO within the same orderType by createdAt ascending", () => {
        const orders: Order[] = [
            { id: "E3", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 300, customerId: "", orderType: OrderType.EMERGENCY, allocations: [] },
            { id: "E1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 100, customerId: "", orderType: OrderType.EMERGENCY, allocations: [] },
            { id: "E2", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 200, customerId: "", orderType: OrderType.EMERGENCY, allocations: [] },
        ];

        const inventory: WarehouseStock[] = [{ supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 10, basePricePerUnit: 0 }];
        const userCredit = 999;

        const callOrder: string[] = [];
        pickAllocationsSpy.mockImplementation((o: any) => {
            callOrder.push(o.id);
            return { allocations: [{ supplierId: "S1", warehouseId: "W1", quantity: 1, unitPrice: 0, totalPrice: 0 }], totalAvailable: 999 };
        });
        sumAllocTotalSpy.mockReturnValue(1 as any);

        assignOrders({ orders, inventory, userCredit });

        expect(callOrder).toEqual(["E1", "E2", "E3"]);
    });

    it("sorting affects outcome: limited credit lets higher-priority (earlier) orders succeed first", () => {
        const orders: Order[] = [
            { id: "D1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 100, customerId: "", orderType: OrderType.DAILY, allocations: [] },
            { id: "E1", status: OrderStatus.IN_PROGRESS, salmonQuantity: 1, createdAt: 200, customerId: "", orderType: OrderType.EMERGENCY, allocations: [] },
        ];

        const inventory: WarehouseStock[] = [{ supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 10, basePricePerUnit: 0 }];

        const userCredit = 10;

        pickAllocationsSpy.mockImplementation((order: any) => ({
            allocations: [{ supplierId: "S1", warehouseId: "W1", quantity: order.salmonQuantity, unitPrice: 0, totalPrice: 0 }],
            totalAvailable: 999,
        }) as any);

        sumAllocTotalSpy.mockReturnValue(10 as any);

        const out = assignOrders({ orders, inventory, userCredit });

        expect(out.orders.find((x) => x.id === "E1")!.status).toBe(OrderStatus.SUCCESS);
        expect(out.orders.find((x) => x.id === "D1")!.status).toBe(OrderStatus.FAILED);
        expect(out.orders.find((x) => x.id === "D1")!.failReason).toBe(OrderFailReason.INSUFFICIENT_CREDIT);
    });
});

function genOrders(n: number) {
    return Array.from({ length: n }, (_, i) => ({
        id: `O-${i}`,
        status: OrderStatus.IN_PROGRESS,
        salmonQuantity: 1,
        createdAt: i,
        customerId: "CT-0001",
        orderType: i % 3 === 0 ? OrderType.EMERGENCY : i % 3 === 1 ? OrderType.OVERDUE : OrderType.DAILY,
        allocations: [],
    }));
}

function genInventory() {
    return [{ supplierId: "S1", warehouseId: "W1", quantityOfSalmonLeft: 100000, basePricePerUnit: 1 }];
}

describe("assignOrders stress", () => {
    it("handles 6000 orders under reasonable time", () => {
        const orders = genOrders(6000);
        const inventory = genInventory();
        const userCredit = 100000;

        const t0 = performance.now();
        const out = assignOrders({ orders, inventory, userCredit });
        const t1 = performance.now();

        expect(out.orders.length).toBe(6000);
        expect(out.inventory[0].quantityOfSalmonLeft).toBeLessThanOrEqual(100000);

        expect(t1 - t0).toBeLessThan(500);
    });
});
