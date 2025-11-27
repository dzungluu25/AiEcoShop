import { useEffect, useState } from "react";
import { authService, type User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  useEffect(() => { authService.getCurrentUser().then(setUser).catch(()=>setUser(null)); }, []);

  const signOut = async () => { try { await authService.signOut(); window.location.href = '/'; } catch { toast({ title: 'Sign out failed', variant: 'destructive' }); } };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-serif text-2xl">Account Settings</h1>
      <Card className="p-4 space-y-2">
        <div className="text-sm">Name: {user?.fullname || '—'}</div>
        <div className="text-sm">Email: {user?.email || '—'}</div>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  );
}

