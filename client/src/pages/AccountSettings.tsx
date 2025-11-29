import { useEffect, useState } from "react";
import { authService, type User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  useEffect(() => { authService.getCurrentUser().then(setUser).catch(()=>setUser(null)); }, []);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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
    </div>
  );
}
