import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOwnerSessionFromRequest, isSessionValid } from "@/lib/owner-auth.server";

interface MessageQuery {
  status?: string;
  search?: string;
  limit?: string;
  offset?: string;
}

export const Route = createFileRoute("/api/owner/messages")({
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
          const url = new URL(request.url);
          const query: MessageQuery = {
            status: url.searchParams.get("status") || undefined,
            search: url.searchParams.get("search") || undefined,
            limit: url.searchParams.get("limit") || "20",
            offset: url.searchParams.get("offset") || "0",
          };

          let q = supabaseAdmin.from("contact_messages").select("*", { count: "exact" });

          if (query.status && query.status !== "all") {
            q = q.eq("status", query.status);
          }

          if (query.search) {
            q = q.or(
              `name.ilike.%${query.search}%,email.ilike.%${query.search}%,subject.ilike.%${query.search}%,message.ilike.%${query.search}%`
            );
          }

          const { data, error, count } = await q
            .order("is_pinned", { ascending: false })
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false })
            .range(parseInt(query.offset!), parseInt(query.offset!) + parseInt(query.limit!) - 1);

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(
            JSON.stringify({ messages: data, total: count, limit: query.limit, offset: query.offset }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err) {
          console.error("Error fetching messages:", err);
          return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
