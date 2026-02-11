import { Navigate, Outlet } from "react-router-dom";
import { getSessionCustomerId } from "./auth";

export default function ProtectedRoute() {
  const customerId = getSessionCustomerId();
  return customerId ? <Outlet /> : <Navigate to="/login" replace />;
}
