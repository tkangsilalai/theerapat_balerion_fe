import { Outlet, useNavigate } from "react-router-dom";
import { logout, getSessionCustomerId } from "@/util/auth";
import { findUserByCustomerId } from "@/mock/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatCredit(x: number): string {
  return x.toFixed(2);
}

export default function ProtectedLayout() {
  const navigate = useNavigate();

  const customerId = getSessionCustomerId();
  const user = customerId ? findUserByCustomerId(customerId) : null;

  return (
    <div className="min-h-screen">
      <header className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            Customer: <span className="font-mono">{customerId}</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Badge variant="secondary" className="text-sm">
                Balance: {formatCredit(user.credit)}
              </Badge>
            )}

            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <Separator className="mt-4" />
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
