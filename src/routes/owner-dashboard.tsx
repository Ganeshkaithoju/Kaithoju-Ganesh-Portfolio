import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { LogOut, Search, Eye, EyeOff, Trash2, Pin, Star, MessageCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  moderated_at?: string;
  status: "pending" | "approved" | "hidden" | "deleted";
  is_pinned: boolean;
  is_featured: boolean;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  hidden: number;
  featured: number;
  pinned: number;
}

export const Route = createFileRoute("/owner-dashboard")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, [filter, search, page]);

  async function fetchData() {
    try {
      setLoading(true);

      const [messagesRes, statsRes] = await Promise.all([
        fetch(
          `/api/owner/messages?status=${filter}&search=${search}&limit=${ITEMS_PER_PAGE}&offset=${
            page * ITEMS_PER_PAGE
          }`
        ),
        fetch("/api/owner/stats"),
      ]);

      if (messagesRes.status === 401 || statsRes.status === 401) {
        navigate({ to: "/owner-login" });
        return;
      }

      const messagesData = await messagesRes.json();
      const statsData = await statsRes.json();

      setMessages(messagesData.messages || []);
      setTotalMessages(messagesData.total || 0);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function updateMessageStatus(
    messageId: string,
    action: "approve" | "hide" | "delete" | "pin" | "feature"
  ) {
    try {
      const response = await fetch(`/api/owner/messages/${messageId}/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update message");
      }

      toast.success(`Message ${action}d successfully`);
      await fetchData();
    } catch (err) {
      console.error(`Error ${action}ing message:`, err);
      toast.error(`Failed to ${action} message`);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/owner/logout", { method: "POST" });
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }

  const filters = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Hidden", value: "hidden" },
    { label: "All Messages", value: "all" },
  ];

  const totalPages = Math.ceil(totalMessages / ITEMS_PER_PAGE);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-text)" }}
            >
              OD
            </div>
            <div>
              <div className="font-display font-semibold">Messages</div>
              <div className="text-xs text-muted-foreground">Owner Dashboard</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
            {[
              { label: "Total", value: stats.total },
              { label: "Pending", value: stats.pending },
              { label: "Approved", value: stats.approved },
              { label: "Hidden", value: stats.hidden },
              { label: "Featured", value: stats.featured },
              { label: "Pinned", value: stats.pinned },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium p-4 text-center"
              >
                <div className="font-display text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters & Search */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 pl-12 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(0);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "glass hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="card-premium p-8 text-center text-muted-foreground">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 opacity-50" aria-hidden="true" />
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-premium p-6 sm:p-8"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{msg.name}</h3>
                    <p className="text-sm text-muted-foreground">{msg.email}</p>
                    {msg.subject && (
                      <p className="mt-1 text-sm font-medium text-foreground">Subject: {msg.subject}</p>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-xs font-medium">
                    {msg.status === "pending" && <span className="text-yellow-400">● Pending</span>}
                    {msg.status === "approved" && <span className="text-green-400">● Approved</span>}
                    {msg.status === "hidden" && <span className="text-gray-400">● Hidden</span>}
                    {msg.is_featured && <span className="ml-2 text-primary">⭐ Featured</span>}
                    {msg.is_pinned && <span className="ml-2 text-primary">📌 Pinned</span>}
                  </div>
                </div>

                <p className="mb-4 leading-relaxed text-muted-foreground">{msg.message}</p>

                <div className="mb-4 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span>
                    Created: {format(new Date(msg.created_at), "MMM d, yyyy HH:mm")}
                  </span>
                  {msg.moderated_at && (
                    <span>
                      Moderated: {format(new Date(msg.moderated_at), "MMM d, yyyy HH:mm")}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {msg.status === "pending" && (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "approve")}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-500/20 px-3 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
                    >
                      ✅ Approve
                    </button>
                  )}
                  {msg.status === "approved" && (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "hide")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-500/20 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-500/30"
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide
                    </button>
                  )}
                  {msg.status === "hidden" && (
                    <button
                      onClick={() => updateMessageStatus(msg.id, "approve")}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Show
                    </button>
                  )}

                  <button
                    onClick={() => updateMessageStatus(msg.id, "pin")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      msg.is_pinned
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "bg-white/10 text-muted-foreground hover:bg-white/20"
                    }`}
                  >
                    <Pin className="h-3.5 w-3.5" aria-hidden="true" /> Pin
                  </button>

                  <button
                    onClick={() => updateMessageStatus(msg.id, "feature")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      msg.is_featured
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "bg-white/10 text-muted-foreground hover:bg-white/20"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden="true" /> Feature
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Delete this message permanently?")) {
                        updateMessageStatus(msg.id, "delete");
                      }
                    }}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
