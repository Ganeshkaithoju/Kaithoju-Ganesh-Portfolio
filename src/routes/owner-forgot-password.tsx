import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/owner-forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/owner-update-password",
      });

      if (error) {
        toast.error(error.message || "Password reset failed");
        return;
      }

      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center px-4 sm:px-6">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-blob rounded-full opacity-30" style={{ background: "radial-gradient(circle, oklch(0.85 0.18 165 / 0.5), transparent 60%)" }} />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] animate-blob rounded-full opacity-25" style={{ background: "radial-gradient(circle, oklch(0.72 0.2 295 / 0.5), transparent 60%)", animationDelay: "4s" }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="card-premium p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              aria-hidden="true"
              className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl"
              style={{ background: "var(--gradient-text)" }}
            >
              <Lock className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {sent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {/* Form */}
          {!sent ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>. 
                Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                Try another email
              </button>
            </div>
          )}

          {/* Helper Info */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground mb-1">Supabase Authentication</p>
                <p>This will send a secure link to your email to reset your Supabase Auth password.</p>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <a
              href="/owner-login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

