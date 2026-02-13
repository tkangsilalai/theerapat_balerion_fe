import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSessionCustomerId,
  setSessionCustomerId,
  clearSessionCustomerId,
  getSessionUserCredit,
  setSessionUserCredit,
  clearSessionUser,
} from "@/store/user/session";
import {} from "@/store/user/session";
import { findUserByCustomerId } from "@/domain/user";
import { UserContext } from "./user.context";
import { clearState as clearOrderState } from "../order/order.storage";

export function UserProvider({ children }: { initialCredit?: number; children: React.ReactNode }) {
  const [customerId, setCustomerIdState] = useState<string | null>(() => getSessionCustomerId());

  const user = customerId ? findUserByCustomerId(customerId) : null;

  const initialCredit = user?.credit ?? 0;

  const [userCredit, setUserCreditState] = useState<number>(
    () => getSessionUserCredit() ?? initialCredit,
  );

  useEffect(() => {
    if (customerId) setSessionCustomerId(customerId);
    else clearSessionCustomerId();
  }, [customerId]);

  useEffect(() => {
    setSessionUserCredit(userCredit);
  }, [userCredit]);

  const login = useCallback((id: string) => {
    setCustomerIdState(id);
    const user = findUserByCustomerId(id);
    setUserCreditState(user ? user.credit : 0);
  }, []);

  const logout = useCallback(() => {
    clearSessionUser();
    if (customerId) clearOrderState(customerId);
    setCustomerIdState(null);
    setUserCreditState(initialCredit);
  }, [customerId, initialCredit]);

  const value = useMemo(
    () => ({
      customerId,
      userCredit,
      setCustomerId: setCustomerIdState,
      setUserCredit: setUserCreditState,
      login,
      logout,
    }),
    [customerId, userCredit, login, logout],
  );

  return <UserContext.Provider value={value}> {children} </UserContext.Provider>;
}
