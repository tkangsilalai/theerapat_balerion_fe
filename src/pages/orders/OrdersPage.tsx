import { useReducer } from "react";
import OrderForm from "./OrderForm";
import OrderList from "./OrderList";
import { orderReducer } from "@/store/order/order.reducer";
import { loadState } from "@/store/order/order.storage";
import { buildInitialInventoryFromMock } from "@/domain/supplierWarehouse";
import type { makeOrder } from "@/store/order/order.factory";

export default function OrdersPage() {
  const [orderState, orderDispatch] = useReducer(orderReducer, undefined, () => {
    return (
      loadState() ?? {
        orders: [],
        inventory: buildInitialInventoryFromMock(),
      }
    );
  });

  function handleCreateOrder(input: {
    type: "ORDER_CREATED";
    order: ReturnType<typeof makeOrder>;
  }) {
    orderDispatch(input);
  }

  function handleRefreshAssign() {
    // orderDispatch({ type: "REFRESH_ASSIGN" });
  }

  return (
    <div className="w-full justify-center flex">
      <OrderForm onCreateOrder={handleCreateOrder} />
      <OrderList orders={orderState.orders} onRefreshAssign={handleRefreshAssign} />
    </div>
  );
}
