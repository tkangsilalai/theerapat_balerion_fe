import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Order } from "@/domain/order";
import { formatCredit, shortId } from "@/domain/util";

type Props = {
  orders: Order[];
  onRefreshAssign?: () => void;
};

function statusBadgeVariant(status: Order["status"]): "default" | "secondary" | "destructive" {
  if (status === "Success") return "default";
  if (status === "Failed") return "destructive";
  return "secondary"; // InProgress
}

export default function OrderList({ orders, onRefreshAssign }: Props) {
  return (
    <Card className="w-4/5 max-w-3xl">
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
        <div className="[&>div]:max-h-[60vh] [&>div]:border [&>div]:rounded-md w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-background sticky top-0">
                <TableHead>Order ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{shortId(o.id)}</TableCell>
                  <TableCell>{o.orderType}</TableCell>
                  <TableCell>{o.salmonQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell>{o.failReason ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {typeof o.totalPrice === "number" ? formatCredit(o.totalPrice) : "-"}
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No orders yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
