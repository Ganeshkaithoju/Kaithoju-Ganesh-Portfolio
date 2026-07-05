import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOwnerSessionFromRequest, isSessionValid } from "@/lib/owner-auth.server";

export const Route = createFileRoute("/api/owner/messages/$id/pin")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const session = getOwnerSessionFromRequest(request);
        if (!session || !isSessionValid(session)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { data: message, error: fetchError } = await supabaseAdmin
            .from("contact_messages")
            .select("is_pinned")
            .eq("id", params.id)
            .single();

          if (fetchError) {
            return new Response(JSON.stringify({ error: fetchError.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { error } = await supabaseAdmin
            .from("contact_messages")
            .update({ is_pinned: !message.is_pinned })
            .eq("id", params.id);

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true, is_pinned: !message.is_pinned }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Error pinning message:", err);
          return new Response(JSON.stringify({ error: "Failed to pin message" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
