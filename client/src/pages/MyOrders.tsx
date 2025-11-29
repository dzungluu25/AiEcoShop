import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderService, type Order } from "@/lib/orders";
import { authService, type User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

export default function MyOrders() {
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [minTotal, setMinTotal] = useState<string>('');
  const [maxTotal, setMaxTotal] = useState<string>('');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  useEffect(() => { authService.getCurrentUser().then(setUser).catch(() => setUser(null)); }, []);
  const { data: orders = [], refetch } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: () => orderService.list(),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (localStorage.getItem('open_orders')) {
      localStorage.removeItem('open_orders');
      refetch();
    }
  }, [refetch]);

  let list = user ? orders.filter(o => o.customerEmail === user.email) : orders;
  if (statusFilter) list = list.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
  const min = parseFloat(minTotal); const max = parseFloat(maxTotal);
  if (!Number.isNaN(min)) list = list.filter(o => o.total >= min);
  if (!Number.isNaN(max)) list = list.filter(o => o.total <= max);
  list = list.slice().sort((a,b)=> sortDesc ? new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());

  const view = (o: Order) => { setSelected(o); setOpen(true); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-serif text-2xl">My Orders</h1>
      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <select className="border rounded px-2 py-1 text-sm" aria-label="Status filter" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <input className="border rounded px-2 py-1 text-sm" aria-label="Min total" placeholder="Min total" value={minTotal} onChange={(e)=>setMinTotal(e.target.value)} />
        <input className="border rounded px-2 py-1 text-sm" aria-label="Max total" placeholder="Max total" value={maxTotal} onChange={(e)=>setMaxTotal(e.target.value)} />
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={sortDesc} onChange={(e)=>setSortDesc(e.target.checked)} /> Newest first</label>
      </Card>
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-2 font-medium">
          <div>ID</div><div>Date</div><div>Status</div><div>Total</div><div>Actions</div>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          {list.length === 0 && (
            <div className="text-sm text-muted-foreground">No orders found</div>
          )}
          {list.map(o => (
            <div key={o.id} className="grid grid-cols-5 gap-2 items-start">
              <div>{o.id}</div>
              <div>{new Date(o.createdAt).toLocaleDateString()}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${o.status==='Shipped'?'bg-blue-100 text-blue-700':o.status==='Processing'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{o.status}</span>
              </div>
              <div>{formatPrice(o.total)}</div>
              <div>
                <Button variant="outline" size="sm" onClick={() => view(o)}>View</Button>
                <Button className="ml-2" variant="ghost" size="sm" onClick={() => setExpanded(expanded===o.id?null:o.id)} aria-expanded={expanded===o.id} aria-controls={`order-${o.id}-items`}>{expanded===o.id?'Hide':'Expand'}</Button>
              </div>
              <div className="col-span-5 text-muted-foreground text-xs">
                {o.items.slice(0,3).map(it => `${it.name} × ${it.quantity}`).join(', ')}{o.items.length>3?` … +${o.items.length-3} more`:''}
              </div>
              {expanded===o.id && (
                <div id={`order-${o.id}-items`} className="col-span-5 border rounded p-3 mt-1">
                  <div className="space-y-3">
                    {o.items.map(it => (
                      <div key={`${o.id}-${it.productId}`} className="flex items-center gap-3">
                        <img src={it.image || ''} alt={it.name} className="w-14 h-14 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{it.name}</div>
                          {it.category && <div className="text-xs text-muted-foreground">{it.category}</div>}
                        </div>
                        <div className="text-sm">{it.quantity} × {formatPrice(it.price)}</div>
                        <div className="text-sm font-medium">{formatPrice(it.price*it.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Tracking: {o.status==='Processing'?'Order received':'In transit'}</div>
                </div>
              )}
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
                  <span>{formatPrice(it.price*it.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{selected ? formatPrice(selected.total) : ''}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
