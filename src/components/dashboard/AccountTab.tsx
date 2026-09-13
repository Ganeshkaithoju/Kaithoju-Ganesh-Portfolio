import { useState, useEffect } from "react";
import { User, Shield, LogOut, Key, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function AccountTab() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate({ to: "/owner-login" });
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Error logging out");
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    
    try {
      setIsSendingReset(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/owner-dashboard`,
      });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Admin Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your Single-Owner CMS account and security settings.</p>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-4 shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Account Profile</h3>
            <p className="text-sm text-muted-foreground">Authenticated via Supabase Auth</p>
            
            <div className="mt-4 space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">Email:</span>
                <span className="font-medium">{user?.email || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">Status:</span>
                <span className="inline-flex items-center gap-1 text-green-500 font-medium">
                  <Shield className="h-3 w-3" /> Active & Verified
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">User ID:</span>
                <span className="font-mono text-xs text-muted-foreground bg-black/20 px-2 py-0.5 rounded">
                  {user?.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Key className="h-5 w-5 text-primary" /> Security
          </div>
          <p className="text-sm text-muted-foreground">
            Update your administrator password. A reset link will be sent to your authenticated email address.
          </p>
          <button
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            Send Password Reset Link
          </button>
        </div>

        <div className="card-premium p-6 space-y-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 text-lg font-semibold text-red-400">
            <LogOut className="h-5 w-5" /> Session
          </div>
          <p className="text-sm text-muted-foreground">
            End your current active session and lock the dashboard. You will need to sign in again.
          </p>
          <button
            onClick={handleLogout}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 text-amber-200/90 text-sm border border-amber-500/20">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
        <p>
          <strong>Single Owner Security:</strong> This portfolio is architected exclusively for one administrator. 
          There is no multi-user management. Do not share your login credentials. All Supabase Row-Level Security (RLS) policies 
          depend on this specific authenticated user ID.
        </p>
      </div>
    </div>
  );
}
