import { Outlet, useNavigate } from "react-router-dom";
import { findUserByCustomerId } from "@/domain/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCredit } from "@/domain/util";
import { useUser } from "@/store/user/useUser";

export default function ProtectedLayout() {
  const { logout, customerId, userCredit } = useUser();
  const navigate = useNavigate();

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
                Balance: {formatCredit(userCredit)}
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

      <main className="p-6 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
