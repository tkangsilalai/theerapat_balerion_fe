import { getSessionCustomerId } from "@/store/user/session";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const customerId = getSessionCustomerId();
  return customerId ? <Outlet /> : <Navigate to="/login" replace />;
}
