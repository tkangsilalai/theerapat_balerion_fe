import OrderForm from "./OrderForm";
import OrderList from "./OrderList";
import { OrderActionType } from "@/store/order/order.reducer";
import { type Order } from "@/domain/order";
import { assignOrders } from "@/domain/assignOrders";
import { useUser } from "@/store/user/useUser";
import { useOrder } from "@/store/order/useOrder";
import { useCallback, useEffect, useRef } from "react";

export default function OrdersPage() {
  const { userCredit: currentUserCredit, setUserCredit } = useUser();

  const { state: orderState, dispatch: orderDispatch } = useOrder();

  function handleCreateOrder(order: Order) {
    orderDispatch({ type: OrderActionType.ORDER_CREATED, order });
  }

  const handleRefreshAssign = useCallback(() => {
    // optional: skip if nothing to do
    const hasInProgress = orderState.orders.some((o) => o.status === "InProgress");
    if (!hasInProgress) return;

    const out = assignOrders({
      orders: orderState.orders,
      inventory: orderState.inventory,
      userCredit: currentUserCredit,
    });

    orderDispatch({
      type: OrderActionType.ORDERS_ASSIGNED,
      orders: out.orders,
      inventory: out.inventory,
    });
    setUserCredit(out.userCredit);
  }, [orderState.orders, orderState.inventory, currentUserCredit, orderDispatch, setUserCredit]);

  // run exactly once when page loads
  const didRun = useRef(false);
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    handleRefreshAssign();
  }, [handleRefreshAssign]);

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
