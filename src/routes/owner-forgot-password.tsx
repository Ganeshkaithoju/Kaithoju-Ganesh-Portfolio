import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { saveOwnerToken } from "../lib/apiClient";

const questions = [
  { id: 1, question: "What is your dream car?" },
  { id: 2, question: "What is your first mobile name?" },
];

export const Route = createFileRoute("/owner-forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "questions">("email");

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    // In a real app, you'd verify the email against the server
    // For now, just check it matches the owner email concept
    if (!email.includes("@")) {
      toast.error("Invalid email");
      return;
    }

    setStep("questions");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!answer1 || !answer2 || !newPassword) {
      toast.error("Please answer both questions and provide a new password");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/owner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          answer1,
          answer2,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Password reset failed");
        return;
      }

      saveOwnerToken(data.token);
      toast.success("Password reset successful! You've been logged in.");
      navigate({ to: "/owner-dashboard" });
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
              {step === "email"
                ? "Enter your email to verify your identity"
                : "Answer your security questions"}
            </p>
          </div>

          {/* Form */}
          {step === "email" ? (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
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
                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Next <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Question 1 */}
              <div>
                <label htmlFor="answer1" className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  {questions[0].question}
                </label>
                <input
                  id="answer1"
                  type="text"
                  placeholder="Your answer..."
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  required
                />
              </div>

              {/* Question 2 */}
              <div>
                <label htmlFor="answer2" className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  {questions[1].question}
                </label>
                <input
                  id="answer2"
                  type="text"
                  placeholder="Your answer..."
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  required
                  minLength={8}
                />
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:shadow-[0_0_40px_oklch(0.85_0.18_165/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Reset Password <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Helper Info */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground mb-1">Security Questions</p>
                <p>Answer these questions with the exact same capitalization and spelling you set them up with.</p>
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
