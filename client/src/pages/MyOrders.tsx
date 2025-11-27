import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderService, type Order } from "@/lib/orders";
import { authService, type User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MyOrders() {
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { authService.getCurrentUser().then(setUser).catch(() => setUser(null)); }, []);
  const { data: orders = [], refetch } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: () => orderService.list(),
  });

  const list = user ? orders.filter(o => o.customerEmail === user.email) : orders;

  const view = (o: Order) => { setSelected(o); setOpen(true); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-serif text-2xl">My Orders</h1>
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-2 font-medium">
          <div>ID</div><div>Date</div><div>Status</div><div>Total</div><div>Actions</div>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          {list.map(o => (
            <div key={o.id} className="grid grid-cols-5 gap-2 items-center">
              <div>{o.id}</div>
              <div>{new Date(o.createdAt).toLocaleDateString()}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${o.status==='Shipped'?'bg-blue-100 text-blue-700':o.status==='Processing'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{o.status}</span>
              </div>
              <div>${o.total.toFixed(2)}</div>
              <div>
                <Button variant="outline" size="sm" onClick={() => view(o)}>View</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>Status: {selected?.status}</div>
            <Separator />
            <div className="space-y-2">
              {(selected?.items||[]).map(it => (
                <div key={it.productId} className="flex justify-between">
                  <span>{it.name} × {it.quantity}</span>
                  <span>${(it.price*it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${selected?.total.toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

