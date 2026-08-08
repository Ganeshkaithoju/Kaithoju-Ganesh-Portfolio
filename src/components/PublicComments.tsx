import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Pin, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiFetch } from "@/lib/apiClient";

interface Comment {
  id: string;
  name: string;
  subject: string | null;
  message: string;
  created_at: string;
  is_pinned: boolean;
  is_featured: boolean;
}

function normalizeSubject(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const subject = value
    .split(/\r?\n/)
    .filter((line) => !/^\s*\d+\s*$/.test(line))
    .join(" ")
    .trim();
  return subject || null;
}

export function PublicComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const response = await apiFetch("/comments/approved", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load comments");
        }

        setComments(
          (data.comments || []).map((comment: Comment) => ({
            ...comment,
            name: typeof comment.name === "string" ? comment.name.trim() : "",
            subject: normalizeSubject(comment.subject),
            message: typeof comment.message === "string" ? comment.message.trim() : "",
          }))
        );
      } catch (err) {
        console.error("Error loading comments:", err);
        setError(err instanceof Error ? err.message : "Failed to load comments");
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, []);

  if (loading) {
    return (
      <section aria-label="Comments" className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </section>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <section id="comments" aria-label="Community comments" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Community
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-4xl font-bold sm:text-5xl md:text-6xl"
          >
            What people <span className="text-gradient">say</span>
          </motion.h2>
        </div>

        {/* Comments Grid */}
        <div className="space-y-4">
          {comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`card-premium relative overflow-hidden p-6 sm:p-8 ${
                comment.is_featured ? "ring-2 ring-primary/50" : ""
              }`}
            >
              {/* Featured Badge */}
              {Boolean(comment.is_featured) && (
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl"
                  style={{ background: "var(--gradient-text)" }}
                />
              )}

              {/* Pinned Indicator */}
              {Boolean(comment.is_pinned) && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-primary">
                  <Pin className="h-3.5 w-3.5" aria-hidden="true" /> Pinned
                </div>
              )}

              <div className="relative">
                {/* Featured Star */}
                {Boolean(comment.is_featured) && (
                  <div aria-hidden="true" className="mb-3 inline-flex items-center gap-1 rounded-full glass px-2 py-1 text-xs">
                    <Star className="h-3 w-3 fill-primary text-primary" /> Featured
                  </div>
                )}

                {comment.subject && (
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground sm:text-xl">
                    {comment.subject}
                  </h3>
                )}

                {/* Message */}
                <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {comment.message}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="grid h-10 w-10 place-items-center rounded-lg glass"
                      style={{ background: "var(--gradient-text)" }}
                    >
                      <span className="font-display text-xs font-bold text-primary-foreground">
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">{comment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
