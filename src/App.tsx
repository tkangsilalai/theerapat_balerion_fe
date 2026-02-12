import LoginPage from "@/pages/login/LoginPage";
import { getSessionCustomerId, login } from "@/domain/auth";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/custom/ProtectedRoute";
import OrdersPage from "./pages/orders/OrdersPage";
import ProtectedLayout from "./components/custom/ProtectedLayout";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onLoginSuccess={(id) => {
              login(id);
              window.location.href = "/orders";
            }}
          />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          getSessionCustomerId() ? (
            <Navigate to="/orders" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
