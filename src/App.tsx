import { useState } from "react";
import LoginPage from "./features/auth/LoginPage";
import { getSessionCustomerId, logout } from "./features/auth/auth";

export default function App() {
  const [customerId, setCustomerId] = useState(() => getSessionCustomerId());

  if (!customerId) {
    return <LoginPage onLoginSuccess={(id) => setCustomerId(id)} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Welcome {customerId}</div>
        <button
          className="rounded-lg border px-3 py-1.5 text-sm"
          onClick={() => {
            logout();
            setCustomerId(null);
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
