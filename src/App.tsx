import LoginPage from "@/pages/login/LoginPage";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/custom/ProtectedRoute";
import OrdersPage from "./pages/orders/OrdersPage";
import ProtectedLayout from "./components/custom/ProtectedLayout";
import { UserProvider } from "./store/user/UserContext";
import { getSessionCustomerId } from "./domain/session";

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={() => {
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
    </UserProvider>
  );
}
