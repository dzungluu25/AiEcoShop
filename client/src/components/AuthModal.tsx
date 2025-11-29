import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { apiClient, setAuthToken } from "@/lib/api";
import type { User } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isOauthLoading, setIsOauthLoading] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullname: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.signUp(signUpData);
      onAuthSuccess(response.user);
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: (error as { message: string }).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.signIn(signInData);
      onAuthSuccess(response.user);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: (error as { message: string }).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuth = async (provider: 'google' | 'facebook') => {
    try {
      setIsOauthLoading(true);
      const urlResp = await apiClient.get<{ url: string }>(`/auth/oauth/${provider}/url`);
      const authUrl = urlResp.url;
      window.open(authUrl, `${provider}-oauth`, 'width=500,height=600');
      const onMessage = (evt: MessageEvent) => {
        if (!evt.data || typeof evt.data !== 'object') return;
        if (evt.data.type === 'oauth-success') {
          setAuthToken(evt.data.token);
          toast({ title: 'Signed in with ' + provider });
          window.removeEventListener('message', onMessage);
          // Fetch full user to ensure role is present
          authService.getCurrentUser().then((full) => {
            onAuthSuccess(full);
          }).catch(() => {
            onAuthSuccess(evt.data.user);
          });
          onClose();
        } else if (evt.data.type === 'oauth-error') {
          toast({ title: 'Authentication failed', description: evt.data.message, variant: 'destructive' });
          window.removeEventListener('message', onMessage);
        }
        setIsOauthLoading(false);
      };
      window.addEventListener('message', onMessage);
    } catch (e: any) {
      setIsOauthLoading(false);
      toast({ title: 'Unable to start authentication', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                  data-testid="input-signin-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                  data-testid="input-signin-password"
                />
              </div>

          <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signin">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex items-center gap-3 mt-3">
            <Button variant="outline" aria-label="Continue with Google" onClick={() => startOAuth('google')} disabled={isOauthLoading} data-testid="button-google">
              {isOauthLoading ? 'Loading...' : 'Continue with Google'}
            </Button>
            <Button variant="outline" aria-label="Continue with Facebook" onClick={() => startOAuth('facebook')} disabled={isOauthLoading} data-testid="button-facebook">
              {isOauthLoading ? 'Loading...' : 'Continue with Facebook'}
            </Button>
          </div>
        </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full Name</Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={signUpData.fullname}
                  onChange={(e) => setSignUpData({ ...signUpData, fullname: e.target.value })}
                  required
                  data-testid="input-signup-fullname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                  data-testid="input-signup-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                  data-testid="input-signup-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signup">
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
