import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOwnerSessionFromRequest, isSessionValid } from "@/lib/owner-auth.server";

export const Route = createFileRoute("/api/owner/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getOwnerSessionFromRequest(request);
        if (!session || !isSessionValid(session)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const [totalResult, pendingResult, approvedResult, hiddenResult, featuredResult, pinnedResult] =
            await Promise.all([
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true }),
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true })
                .eq("status", "pending"),
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true })
                .eq("status", "approved"),
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true })
                .eq("status", "hidden"),
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true })
                .eq("is_featured", true),
              supabaseAdmin
                .from("contact_messages")
                .select("id", { count: "exact", head: true })
                .eq("is_pinned", true),
            ]);

          return new Response(
            JSON.stringify({
              total: totalResult.count || 0,
              pending: pendingResult.count || 0,
              approved: approvedResult.count || 0,
              hidden: hiddenResult.count || 0,
              featured: featuredResult.count || 0,
              pinned: pinnedResult.count || 0,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err) {
          console.error("Error fetching stats:", err);
          return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
