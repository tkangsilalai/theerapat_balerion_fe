import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/domain/order";
import { formatCredit, shortId } from "@/domain/util";
import { OrderStatus } from "@/domain/orderType";

function statusBadgeVariant(status: Order["status"]): "default" | "secondary" | "destructive" {
  if (status === "Success") return "default";
  if (status === "Failed") return "destructive";
  return "secondary";
}

// Responsive-ish column template:
// - ID / Type / Status / Total / Action
const GRID_COLS = "grid grid-cols-[1fr_1fr_0.6fr_1fr_1.2fr_1fr_1fr] items-center";

export function OrderTable({
  orders,
  onDeleteOrder,
}: {
  orders: Order[];
  onDeleteOrder?: (id: Order["id"]) => void;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div ref={parentRef} className="max-h-[60vh] overflow-auto border rounded-md w-full">
      {/* Header */}
      <div
        className={[
          GRID_COLS,
          "sticky top-0 z-10 bg-background border-b text-sm text-muted-foreground font-medium",
          "h-10 px-2",
        ].join(" ")}
        role="row"
      >
        <div>Order ID</div>
        <div>Type</div>
        <div>Qty</div>
        <div>Status</div>
        <div>Reason</div>
        <div className="text-right">Total</div>
        <div className="text-right">Action</div>
      </div>

      {/* Body */}
      {orders.length === 0 ? (
        <div className="p-3 text-sm">No orders yet.</div>
      ) : (
        <div style={{ position: "relative", height: totalSize }}>
          {virtualItems.map((vi) => {
            const o = orders[vi.index];
            return (
              <div
                key={o.id}
                className={[
                  GRID_COLS,
                  "px-2 border-b bg-background text-sm",
                  "hover:bg-muted/50",
                ].join(" ")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vi.start}px)`,
                  height: vi.size,
                }}
                role="row"
              >
                <div className="truncate">{shortId(o.id)}</div>
                <div className="truncate">{o.orderType}</div>
                <div>{o.salmonQuantity}</div>

                <div>
                  <Badge variant={statusBadgeVariant(o.status)}>{o.status}</Badge>
                </div>

                <div className="truncate">{o.failReason ?? "-"}</div>

                <div className="text-right">
                  {typeof o.totalPrice === "number" ? formatCredit(o.totalPrice) : "-"}
                </div>

                <div className="text-right">
                  {onDeleteOrder && o.status === OrderStatus.IN_PROGRESS ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteOrder(o.id)}
                    >
                      Delete
                    </Button>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
