import LoginPage from "@/pages/login/LoginPage";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/custom/ProtectedRoute";
import OrdersPage from "./pages/orders/OrdersPage";
import ProtectedLayout from "./components/custom/ProtectedLayout";
import { UserProvider } from "./store/user/UserContext";
import { getSessionCustomerId } from "./store/user/session";
import { OrderProvider } from "./store/order/OrderContext";

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLoginSuccess={() => {
        navigate("/orders", { replace: true });
      }}
    />
  );
}

export default function App() {
  return (
    <UserProvider>
      <OrderProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

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
      </OrderProvider>
    </UserProvider>
  );
}
