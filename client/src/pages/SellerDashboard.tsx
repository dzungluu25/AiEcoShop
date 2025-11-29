import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { productService, type BackendProduct } from "@/lib/products";
import { orderService, type Order } from "@/lib/orders";
import { authService, type User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { formatPrice } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SellerDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products'|'orders'|'analytics'>('products');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState<{ name:string; price:number; stock:number; image?:File|null; category?:string }>({ name:'', price:0, stock:0 });
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editing, setEditing] = useState<{ id:string; name:string; price:number; stock:number; category?:string; image?:File|null }>({ id:'', name:'', price:0, stock:0 });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id:string; name:string } | null>(null);

  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    authService.getCurrentUser().then((u)=>{ setCurrentUser(u); setAuthChecked(true);} ).catch(() => { setAuthChecked(true); setAuthOpen(true); });
  }, []);

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => productService.getAllProducts({ limit: 500 }),
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: () => orderService.list(),
    refetchInterval: 10000,
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openOrder = async (o: Order) => {
    setSelectedOrder(o);
    setDialogOpen(true);
  };

  const saveProduct = async () => {
    try {
      setUploading(true);
      let imageUrl: string | undefined;
      if (newProduct.image) {
        const up = await productService.uploadImage(newProduct.image);
        imageUrl = up.url;
      }
      const created = await productService.createProduct({
        name: newProduct.name,
        price: newProduct.price,
        stock: newProduct.stock,
        image: imageUrl,
        category: newProduct.category || 'General',
      } as any);
      toast({ title: 'Product created', description: created.name });
      setNewProduct({ name:'', price:0, stock:0 });
      setUploading(false);
      refetchProducts();
    } catch (e:any) {
      setUploading(false);
      toast({ title: 'Create failed', description: e?.message || 'Error', variant: 'destructive' });
    }
  };

  const openEdit = (p: { id:string; name:string; price:number; stock?:number; category?:string }) => {
    setEditing({ id: p.id, name: p.name, price: p.price, stock: p.stock ?? 0, category: p.category, image: null });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      setSavingEdit(true);
      let imageUrl: string | undefined;
      if (editing.image) {
        const up = await productService.uploadImage(editing.image);
        imageUrl = up.url;
      }
      await productService.updateProduct(editing.id, {
        name: editing.name,
        price: editing.price,
        stock: editing.stock,
        category: editing.category,
        image: imageUrl,
      } as any);
      toast({ title: 'Product updated', description: editing.name });
      setSavingEdit(false);
      setEditOpen(false);
      refetchProducts();
    } catch (e:any) {
      setSavingEdit(false);
      toast({ title: 'Update failed', description: e?.message || 'Error', variant: 'destructive' });
    }
  };

  const confirmDelete = (p: { id:string; name:string }) => { setDeleteTarget(p); setDeleteOpen(true); };
  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteProduct(deleteTarget.id);
      toast({ title: 'Product deleted', description: deleteTarget.name });
      setDeleteOpen(false);
      setDeleteTarget(null);
      refetchProducts();
    } catch (e:any) {
      toast({ title: 'Delete failed', description: e?.message || 'Error', variant: 'destructive' });
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast({ title: 'Order updated', description: `${id} → ${status}` });
      refetchOrders();
    } catch {}
  };

  const exportOrders = async () => {
    try {
      const csv = await orderService.exportCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'orders.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const printOrdersPdf = () => {
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) return;
    const rows = orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.customerEmail}</td>
        <td>${new Date(o.createdAt).toLocaleString()}</td>
        <td>${o.status}</td>
        <td style="text-align:right">${formatPrice(o.total)}</td>
      </tr>
    `).join('');
    const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
    const html = `
      <html>
        <head>
          <title>Orders Report</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin: 0 0 8px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f7f7f7; text-align: left; }
            tfoot td { font-weight: 600; }
            @media print { @page { margin: 16mm; } }
          </style>
        </head>
        <body>
          <h1>Seller Orders Report</h1>
          <div class="meta">Generated at ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Total Revenue</td>
                <td style="text-align:right">${formatPrice(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch {} }, 300);
  };

  // Allow access to analytics even if not logged in; gate actions elsewhere

  const cartCount = (() => {
    try {
      const stored = localStorage.getItem('cart_items');
      const items = stored ? JSON.parse(stored) : [];
      return items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
    } catch { return 0; }
  })();

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 w-full max-w-md text-center space-y-4">
          <h1 className="font-serif text-2xl">Loading</h1>
          <p className="text-sm text-muted-foreground">Checking access…</p>
        </Card>
      </div>
    );
  }
  if (!currentUser || !currentUser.role || currentUser.role.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 w-full max-w-md text-center space-y-4">
          <h1 className="font-serif text-2xl">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">Only admin users can view the seller dashboard.</p>
          <Button onClick={() => setAuthOpen(true)} aria-label="Log in">Log In</Button>
          <AuthModal isOpen={authOpen} onClose={()=>setAuthOpen(false)} onAuthSuccess={(u)=>{setCurrentUser(u as any); setAuthOpen(false);}} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onCartClick={() => { localStorage.setItem('open_cart','1'); setLocation('/'); }}
        onAIClick={() => { localStorage.setItem('open_ai','1'); setLocation('/'); }}
        onAuthClick={() => { localStorage.setItem('open_auth','1'); setLocation('/'); }}
        cartItemCount={cartCount}
      />
      <main className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h2 className="font-serif text-xl">Seller</h2>
        <Button variant={activeTab==='products'?'default':'outline'} onClick={() => setActiveTab('products')}>Products</Button>
        <Button variant={activeTab==='orders'?'default':'outline'} onClick={() => setActiveTab('orders')}>Orders</Button>
        <Button variant={activeTab==='analytics'?'default':'outline'} onClick={() => setActiveTab('analytics')}>Analytics</Button>
        <Separator />
        <Button onClick={() => setAuthOpen(true)} variant="outline">Quick Sign-In</Button>
        <Button onClick={exportOrders} variant="outline">Export Orders</Button>
        <Button onClick={printOrdersPdf} variant="outline">Print PDF Report</Button>
      </aside>
      <main className="p-6">
        {!currentUser && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Viewing as guest</h3>
                <p className="text-sm text-muted-foreground">Sign in to manage products and orders. Analytics are available in read-only mode.</p>
              </div>
              <Button variant="outline" onClick={() => setAuthOpen(true)}>Sign In</Button>
            </div>
          </Card>
        )}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Input placeholder="Search products" value={search} onChange={(e)=>setSearch(e.target.value)} />
              <Button onClick={()=>refetchProducts()}>Refresh</Button>
            </div>
            <Card className="p-4">
              <div className="grid grid-cols-5 gap-2 font-medium">
                <div>Name</div><div>Price</div><div>Stock</div><div>Category</div><div>Actions</div>
              </div>
              <Separator className="my-3" />
              <ScrollArea className="max-h-[420px]">
                <div className="space-y-2">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="grid grid-cols-5 gap-2 items-center">
                      <div className="truncate">{p.name}</div>
                      <div>${p.price.toFixed(2)}</div>
                      <div>
                        {(() => { const s = p.stock ?? 0; return (
                          <span className={`px-2 py-1 rounded text-xs ${s > 20 ? 'bg-green-100 text-green-700' : s > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s}</span>
                        ); })()}
                      </div>
                      <div>{p.category}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>openEdit({ id:p.id, name:p.name, price:p.price, stock:p.stock, category:p.category })} disabled={!currentUser}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={()=>confirmDelete({ id:p.id, name:p.name })} disabled={!currentUser}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update product details and save your changes.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="Name" value={editing.name} onChange={(e)=>setEditing({...editing,name:e.target.value})} />
                  <Input type="number" placeholder="Price" value={editing.price} onChange={(e)=>setEditing({...editing,price:parseFloat(e.target.value||'0')})} />
                  <Input type="number" placeholder="Stock" value={editing.stock} onChange={(e)=>setEditing({...editing,stock:parseInt(e.target.value||'0')})} />
                  <Input placeholder="Category" value={editing.category||''} onChange={(e)=>setEditing({...editing,category:e.target.value})} />
                  <input type="file" accept="image/*" onChange={(e)=>setEditing({...editing,image:e.target.files?.[0]||null})} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
                  <Button onClick={saveEdit} disabled={savingEdit}>{savingEdit?'Saving...':'Save Changes'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                  <DialogDescription>Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={()=>setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={doDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Card className="p-4 space-y-3">
              <h3 className="font-medium">Add Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input placeholder="Name" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct,name:e.target.value})} />
                <Input type="number" placeholder="Price" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct,price:parseFloat(e.target.value||'0')})} />
                <Input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e)=>setNewProduct({...newProduct,stock:parseInt(e.target.value||'0')})} />
                <Input placeholder="Category" value={newProduct.category||''} onChange={(e)=>setNewProduct({...newProduct,category:e.target.value})} />
                <input type="file" accept="image/*" onChange={(e)=>setNewProduct({...newProduct,image:e.target.files?.[0]||null})} />
              </div>
              <Button onClick={()=>{ if(!currentUser){ setAuthOpen(true); return; } saveProduct(); }} disabled={uploading || !currentUser}>{uploading?'Uploading...':'Save Product'}</Button>
            </Card>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="grid grid-cols-5 gap-2 font-medium">
                <div>ID</div><div>Customer</div><div>Status</div><div>Total</div><div>Actions</div>
              </div>
              <Separator className="my-3" />
              <ScrollArea className="max-h-[420px]">
                <div className="space-y-2">
                  {orders.map(o => (
                    <div key={o.id} className="grid grid-cols-5 gap-2 items-center">
                      <div>{o.id}</div>
                      <div className="truncate">{o.customerName}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${o.status==='Shipped'?'bg-blue-100 text-blue-700':o.status==='Processing'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                      </div>
                      <div>${o.total.toFixed(2)}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>openOrder(o)} disabled={!currentUser}>Details</Button>
                        <Button variant="outline" size="sm" onClick={()=>updateOrderStatus(o.id,'Processing')} disabled={!currentUser}>Process</Button>
                        <Button variant="outline" size="sm" onClick={()=>updateOrderStatus(o.id,'Shipped')} disabled={!currentUser}>Ship</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <div>Customer: {selectedOrder?.customerName}</div>
                  <div>Email: {selectedOrder?.customerEmail}</div>
                  <Separator />
                  <div className="space-y-2">
                    {(selectedOrder?.items||[]).map(it => (
                      <div key={it.productId} className="flex justify-between">
                        <span>{it.name} × {it.quantity}</span>
                        <span>${(it.price*it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${selectedOrder?.total.toFixed(2)}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Revenue</h3>
              <div className="grid grid-cols-12 gap-2 items-end h-40">
                {[...Array(12)].map((_,i)=>{
                  const monthTotal = orders.filter(o=> new Date(o.createdAt).getMonth()===i).reduce((s,o)=>s+o.total,0);
                  const h = Math.min(100, Math.round(monthTotal));
                  return (<div key={i} className="bg-primary/30" style={{height:`${Math.max(8,h)}px`}} />);
                })}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Top Products</h3>
              <div className="space-y-2">
                {products.slice(0,10).map(p=> (
                  <div key={p.id} className="flex justify-between">
                    <span className="truncate">{p.name}</span>
                    <span>${p.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Key Metrics</h3>
              {(() => {
                const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
                const totalOrders = orders.length;
                const itemsSold = orders.reduce((s,o)=>s+o.items.reduce((ss,it)=>ss+it.quantity,0),0);
                const avgOrderValue = totalOrders ? totalRevenue/totalOrders : 0;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                      <div className="text-xl font-semibold">{formatPrice(totalRevenue)}</div>
                    </div>
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                      <div className="text-xl font-semibold">{totalOrders}</div>
                    </div>
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Items Sold</div>
                      <div className="text-xl font-semibold">{itemsSold}</div>
                    </div>
                    <div className="border rounded p-3">
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                      <div className="text-xl font-semibold">{formatPrice(avgOrderValue)}</div>
                    </div>
                  </div>
                );
              })()}
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Monthly Revenue</h3>
              {(() => {
                const months = Array.from({length:12}, (_,i)=>i);
                const data = months.map(m=>({
                  month: new Date(2020,m,1).toLocaleString(undefined,{month:'short'}),
                  revenue: orders.filter(o=> new Date(o.createdAt).getMonth()===m).reduce((s,o)=>s+o.total,0)
                }));
                return (
                  <ChartContainer config={{ revenue:{ label:'Revenue', color:'hsl(var(--primary))' } }} className="h-64">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v)=>formatPrice(Number(v))} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value)=>[formatPrice(Number(value)), 'Revenue']} />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                  </ChartContainer>
                );
              })()}
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Sales by Category</h3>
              {(() => {
                const byCategory: Record<string, number> = {};
                const catById = new Map(products.map(p=>[p.id,p.category]));
                orders.forEach(o=>{
                  o.items.forEach(it=>{
                    const cat = catById.get(it.productId) || 'General';
                    byCategory[cat] = (byCategory[cat]||0) + it.price*it.quantity;
                  });
                });
                const entries = Object.entries(byCategory).map(([name,value])=>({ name, value }));
                const colors = ['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#f87171'];
                return (
                  <ChartContainer config={{ revenue:{ label:'Revenue', color:'hsl(var(--primary))' } }} className="h-64">
                    <PieChart>
                      <Pie data={entries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                        {entries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent formatter={(v)=>[formatPrice(Number(v)),'Revenue']} />} />
                    </PieChart>
                  </ChartContainer>
                );
              })()}
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Order Status</h3>
              {(() => {
                const statuses = orders.reduce<Record<string,number>>((acc,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc; },{});
                const data = Object.entries(statuses).map(([status,count])=>({ status, count }));
                return (
                  <ChartContainer config={{ orders:{ label:'Orders', color:'hsl(var(--accent))' } }} className="h-64">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-orders)" />
                    </BarChart>
                  </ChartContainer>
                );
              })()}
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-3">Best Sellers</h3>
              {(() => {
                const totals: Record<string,{ name:string; qty:number; revenue:number }> = {};
                const nameById = new Map(products.map(p=>[p.id,p.name]));
                orders.forEach(o=>{
                  o.items.forEach(it=>{
                    const name = nameById.get(it.productId) || it.name;
                    const cur = totals[it.productId] || { name, qty:0, revenue:0 };
                    cur.qty += it.quantity;
                    cur.revenue += it.price*it.quantity;
                    totals[it.productId] = cur;
                  });
                });
                const top = Object.values(totals).sort((a,b)=>b.qty-a.qty).slice(0,5);
                return (
                  <div className="space-y-2">
                    {top.map((p,i)=> (
                      <div key={i} className="flex justify-between">
                        <span className="truncate">{p.name}</span>
                        <span className="text-sm text-muted-foreground">{p.qty} • {formatPrice(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </div>
        )}
      </main>
      </div>
      </main>
      <Footer />
      <AuthModal isOpen={authOpen} onClose={()=>setAuthOpen(false)} onAuthSuccess={(u)=>{setCurrentUser(u as any); setAuthOpen(false);}} />
    </div>
  );
}
