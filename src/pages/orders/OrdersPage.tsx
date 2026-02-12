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
import { useEffect, useMemo } from "react";
import {
  getAvailableSalmonLeftForScope,
  listSuppliers,
  listSupplierWarehouses,
} from "@/mock/supplierWarehouse";
import ComboboxField from "@/components/custom/comboboxField";

const OrderTypeSchema = z.enum(["Emergency", "Overdue", "Daily"]).or(z.literal(""));

const FormSchema = z.object({
  salmonQuantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
  supplierId: z.string().trim().optional(),
  warehouseId: z.string().trim().optional(),
  orderType: OrderTypeSchema,
});

type FormValues = z.infer<typeof FormSchema>;

export default function OrdersPage() {
  const suppliers = useMemo(() => listSuppliers(), []);

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

  useEffect(() => {
    console.log("Supplier changed:", selectedSupplierId);
  }, [selectedSupplierId]);

  const supplierWarehouses = useMemo(() => {
    if (!selectedSupplierId) return [];
    return listSupplierWarehouses(selectedSupplierId) ?? [];
  }, [selectedSupplierId]);

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      supplierId: values.supplierId?.trim() ? values.supplierId.trim() : undefined,
      warehouseId: values.warehouseId?.trim() ? values.warehouseId.trim() : undefined,
    };

    const totalAvailable = getAvailableSalmonLeftForScope(payload.supplierId, payload.warehouseId);

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

    console.log("Create order:", payload);
  }

  return (
    <Card className="w-1/3 max-w-3xl">
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
                    items={suppliers.map((s) => ({ value: s.supplierId }))}
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
                    items={supplierWarehouses?.map((w) => ({ value: w.warehouseId })) ?? []}
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
