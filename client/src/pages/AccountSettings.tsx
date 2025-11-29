import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService, type User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { transactionsService } from "@/lib/transactions";

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  useEffect(() => { authService.getCurrentUser().then(setUser).catch(()=>setUser(null)); }, []);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/transactions', page, limit, from, to, search],
    queryFn: () => transactionsService.list({ page, limit, from: from || undefined, to: to || undefined, q: search || undefined }),
    keepPreviousData: true,
    staleTime: 60_000,
  });

  const exportCSV = async () => {
    try {
      const text = await transactionsService.exportCSV({ page, limit, from: from || undefined, to: to || undefined, q: search || undefined });
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const signOut = async () => { try { await authService.signOut(); window.location.href = '/'; } catch { toast({ title: 'Sign out failed', variant: 'destructive' }); } };
  const changePassword = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      toast({ title: 'Invalid input', description: 'Check your passwords', variant: 'destructive' });
      return;
    }
    try {
      setChanging(true);
      await authService.changePassword(oldPassword, newPassword);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: 'Password changed' });
    } catch (e: any) {
      toast({ title: 'Change failed', description: e?.message || 'Error', variant: 'destructive' });
    } finally { setChanging(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-serif text-2xl">Account Settings</h1>
      <Card className="p-4 space-y-2">
        <div className="text-sm">Name: {user?.fullname || '—'}</div>
        <div className="text-sm">Email: {user?.email || '—'}</div>
      </Card>
      <Card className="p-4 space-y-3">
        <h2 className="font-medium">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2 text-sm" type="password" placeholder="Current password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} />
          <input className="border rounded px-3 py-2 text-sm" type="password" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
          <input className="border rounded px-3 py-2 text-sm" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
        </div>
        <div>
          <Button onClick={changePassword} disabled={changing}>{changing ? 'Changing...' : 'Change Password'}</Button>
        </div>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>

      <Card className="p-4 space-y-4" aria-label="Historical transactions">
        <h2 className="font-medium">Historical Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input aria-label="Search by transaction ID or amount" placeholder="Search by ID or amount" value={search} onChange={(e)=>setSearch(e.target.value)} />
          <Input aria-label="From date" type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          <Input aria-label="To date" type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          <div className="flex gap-2">
            <Button aria-label="Apply filters" onClick={()=>refetch()}>Apply</Button>
            <Button aria-label="Reset filters" variant="outline" onClick={()=>{ setSearch(""); setFrom(""); setTo(""); setPage(1); refetch(); }}>Reset</Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading transactions…</div>
        )}
        {error && (
          <div className="text-sm text-destructive">Failed to load transactions</div>
        )}
        {data && data.items.length === 0 && (
          <div className="text-sm text-muted-foreground">No transactions found</div>
        )}
        {data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <Table role="table" aria-label="Transactions table">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col">Type</TableHead>
                  <TableHead scope="col">Amount</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((t)=> (
                  <TableRow key={t.id} tabIndex={0}>
                    <TableCell>{transactionsService.formatDisplayDate(t.ts)}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell>{transactionsService.formatCurrency(t.amount, t.currency)}</TableCell>
                    <TableCell className="capitalize">{t.status}</TableCell>
                    <TableCell className="font-mono text-xs break-all">{t.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">Page {data?.page || page} of {data?.pageCount || 1} • Total {data?.total || 0}</div>
          <div className="flex items-center gap-2">
            <Button aria-label="Previous page" variant="outline" onClick={()=>setPage((p)=>Math.max(1, p-1))} disabled={(data?.page || page) <= 1}>Prev</Button>
            <Button aria-label="Next page" variant="outline" onClick={()=>setPage((p)=>Math.min((data?.pageCount || 1), p+1))} disabled={(data?.page || page) >= (data?.pageCount || 1)}>Next</Button>
            <Button aria-label="Export to CSV" onClick={exportCSV}>Export CSV</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
