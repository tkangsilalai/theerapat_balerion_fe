import { useNavigate } from "react-router-dom";
import { getSessionCustomerId, logout } from "@/util/auth";

export default function OrdersPage() {
  const navigate = useNavigate();
  const customerId = getSessionCustomerId();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Welcome {customerId}</div>

        <button
          className="rounded-lg border px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </button>
      </div>

      {/* TODO: order form + order list */}
    </div>
  );
}
