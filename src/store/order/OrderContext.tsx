import React, { useEffect, useMemo, useReducer } from "react";
import { OrderContext } from "./order.context";
import { orderReducer, initialOrderState, OrderActionType } from "./order.reducer";
import { loadState, saveState, clearState } from "./order.storage";
import { useUser } from "@/store/user/useUser";

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { customerId } = useUser();

  const [state, dispatch] = useReducer(orderReducer, undefined, () => {
    if (!customerId) return initialOrderState;

    return loadState(customerId) ?? initialOrderState;
  });

  useEffect(() => {
    if (!customerId) return;
    saveState(customerId, state);
  }, [customerId, state]);

  useEffect(() => {
    if (customerId) return;
    clearState(customerId!);
    dispatch({ type: OrderActionType.RESET });
  }, [customerId]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
