import LoginPage from "@/pages/login/LoginPage";
import { getSessionCustomerId, login } from "@/util/auth";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/util/ProtectedRoute";
import OrdersPage from "./pages/orders/OrdersPage";

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
        <Route path="/orders" element={<OrdersPage />} />
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
