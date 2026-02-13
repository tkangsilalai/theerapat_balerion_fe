import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { Order } from "@/domain/order";
import { OrderTable } from "./OrderTable";

type Props = {
  orders: Order[];
  onRefreshAssign?: () => void;
  onDeleteOrder?: (orderId: Order["id"]) => void;
};

export default function OrderList({ orders, onRefreshAssign, onDeleteOrder }: Props) {
  return (
    <Card className="w-full lg:w-4/5 max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>

          {onRefreshAssign ? (
            <Button type="button" variant="outline" onClick={onRefreshAssign}>
              Refresh / Assign
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <OrderTable orders={orders} onDeleteOrder={onDeleteOrder} />
      </CardContent>
    </Card>
  );
}
