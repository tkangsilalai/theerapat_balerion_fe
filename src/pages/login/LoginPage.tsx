import { useMemo, useState } from "react";
import { listUsers, type User } from "@/mock/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { login } from "@/util/auth";

type Props = {
  onLoginSuccess: (customerId: string) => void;
};

function formatCredit(x: number): string {
  return x.toFixed(2);
}

export default function LoginPage({ onLoginSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);

  const [pickQuery, setPickQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const users = useMemo(() => listUsers(), []);

  const filtered = useMemo(() => {
    const q = pickQuery.trim().toUpperCase();
    if (!q) return users;
    return users.filter(
      (u) => u.customerId.toUpperCase().includes(q) || u.name.toUpperCase().includes(q),
    );
  }, [pickQuery, users]);

  function handlePick(user: User) {
    setError(null);
    setDialogOpen(false);

    try {
      login(user.customerId);
      onLoginSuccess(user.customerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-1/3 max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Login</CardTitle>
          <CardDescription className="text-lg">Pick user.</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-center">
          {error && <div>{error}</div>}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-lg cursor-pointer" type="button">
                Pick customer
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a customer</DialogTitle>
              </DialogHeader>

              <Input
                placeholder="Search by CT-XXXX or name…"
                value={pickQuery}
                onChange={(e) => setPickQuery(e.target.value)}
                autoComplete="off"
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((u) => (
                    <TableRow
                      key={u.customerId}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePick(u)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handlePick(u);
                      }}
                    >
                      <TableCell className="font-mono">{u.customerId}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell className="text-right">{formatCredit(u.credit)}</TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>No users match.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
