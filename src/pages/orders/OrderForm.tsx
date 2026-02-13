import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";
import {
  getAvailableSalmonLeftForScope,
  listSuppliersFromInventory,
  listSupplierWarehousesFromInventory,
} from "@/domain/supplierWarehouse";
import ComboboxField from "@/components/custom/comboboxField";
import { getSessionCustomerId } from "@/store/user/session";
import { makeOrder } from "@/store/order/order.factory";
import { type Order } from "@/domain/order";
import { OrderType } from "@/domain/orderType";
import { generateOrders } from "@/domain/generateOrders";
import { useOrder } from "@/store/order/useOrder";
const OrderTypeSchema = z
  .enum([OrderType.EMERGENCY, OrderType.OVERDUE, OrderType.DAILY])
  .or(z.literal(""));

const FormSchema = z.object({
  salmonQuantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
  supplierId: z.string().trim().optional(),
  warehouseId: z.string().trim().optional(),
  orderType: OrderTypeSchema,
});

type FormValues = z.infer<typeof FormSchema>;

export default function OrderForm({ onCreateOrder }: { onCreateOrder: (input: Order) => void }) {
  const { state } = useOrder();
  const inventory = state.inventory;

  const customerId = getSessionCustomerId();
  const suppliers = useMemo(() => listSuppliersFromInventory(inventory), [inventory]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      salmonQuantity: 1,
      supplierId: "",
      warehouseId: "",
      orderType: "",
    },
  });

  const selectedSupplierId = useWatch({
    control: form.control,
    name: "supplierId",
  });

  const supplierWarehouses = useMemo(() => {
    if (!selectedSupplierId) return [];
    return listSupplierWarehousesFromInventory(selectedSupplierId, inventory) ?? [];
  }, [selectedSupplierId, inventory]);

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      supplierId: values.supplierId?.trim() ? values.supplierId.trim() : undefined,
      warehouseId: values.warehouseId?.trim() ? values.warehouseId.trim() : undefined,
    };

    const totalAvailable = getAvailableSalmonLeftForScope(
      inventory,
      payload.supplierId,
      payload.warehouseId,
    );

    if (payload.salmonQuantity > totalAvailable) {
      form.setError("salmonQuantity", {
        type: "manual",
        message: `Only ${totalAvailable} salmon currently available. Please reduce quantity or try again later.`,
      });
      return;
    }

    if (!payload.orderType) {
      form.setError("orderType", {
        type: "manual",
        message: "Please select an order type.",
      });
      return;
    }

    const order = makeOrder({
      customerId: customerId!,
      salmonQuantity: payload.salmonQuantity,
      supplierId: payload.supplierId,
      warehouseId: payload.warehouseId,
      orderType: payload.orderType,
    });

    onCreateOrder(order);
  }

  const place5000 = () => {
    if (!customerId) return;

    const batch = generateOrders(5000, customerId);

    for (const order of batch) {
      onCreateOrder(order);
    }
  };

  return (
    <Card className="w-1/5 max-w-3xl">
      <CardHeader>
        <CardTitle>Create Order</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="salmonQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salmon Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.currentTarget.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier ID (optional)</FormLabel>
                  <ComboboxField
                    value={field.value ?? ""}
                    onChange={(v) => {
                      field.onChange(v);
                      form.setValue("warehouseId", "");
                    }}
                    placeholder="Select a supplier"
                    searchPlaceholder="Search suppliers..."
                    items={suppliers.map((s) => ({
                      value: s.supplierId,
                      label: `${s.supplierId} • Qty: ${s.totalSalmonLeft}`,
                    }))}
                    disabled={suppliers.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse ID (optional)</FormLabel>
                  <ComboboxField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Select a warehouse"
                    searchPlaceholder="Search warehouses..."
                    items={
                      supplierWarehouses?.map((w) => ({
                        value: w.warehouseId,
                        label: `${w.warehouseId} • Qty: ${w.quantityOfSalmonLeft}`,
                      })) ?? []
                    }
                    disabled={supplierWarehouses?.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="cursor-pointer">
              Place Order
            </Button>
            <hr className="my-4" />
            <Button type="button" className="cursor-pointer" onClick={place5000}>
              Place 5,000 Order
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
