import { useReducer } from "react";
import OrderForm from "./OrderForm";
import OrderList from "./OrderList";
import { OrderActionType, orderReducer } from "@/store/order/order.reducer";
import { loadState } from "@/store/order/order.storage";
import { buildInitialInventoryFromMock } from "@/domain/supplierWarehouse";
import { type Order } from "@/domain/order";
import { assignOrders } from "@/domain/assignOrders";
import { useUser } from "@/store/user/useUser";

export default function OrdersPage() {
  const { userCredit: currentUserCredit, setUserCredit } = useUser();

  const [orderState, orderDispatch] = useReducer(orderReducer, undefined, () => {
    return (
      loadState() ?? {
        orders: [],
        inventory: buildInitialInventoryFromMock(),
      }
    );
  });

  function handleCreateOrder(order: Order) {
    orderDispatch({ type: OrderActionType.ORDER_CREATED, order });
  }

  function handleRefreshAssign() {
    // orderDispatch({ type: "REFRESH_ASSIGN" });
    const { orders, inventory, userCredit } = assignOrders({
      orders: orderState.orders,
      inventory: orderState.inventory,
      userCredit: currentUserCredit,
    });

    setUserCredit(userCredit);

    orderDispatch({
      type: OrderActionType.ORDERS_ASSIGNED,
      orders,
      inventory,
    });
  }

  return (
    <div className="w-full justify-center flex">
      <OrderForm onCreateOrder={handleCreateOrder} />
      <OrderList
        orders={orderState.orders}
        onRefreshAssign={handleRefreshAssign}
        onDeleteOrder={(orderId) => orderDispatch({ type: OrderActionType.ORDER_DELETED, orderId })}
      />
    </div>
  );
}
