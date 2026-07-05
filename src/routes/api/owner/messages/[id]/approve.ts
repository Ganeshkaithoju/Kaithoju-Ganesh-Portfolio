import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOwnerSessionFromRequest, isSessionValid } from "@/lib/owner-auth.server";

export const Route = createFileRoute("/api/owner/messages/id/approve")({
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
          const { error } = await supabaseAdmin
            .from("contact_messages")
            .update({
              status: "approved",
              is_approved: true,
              moderated_at: new Date().toISOString(),
            })
            .eq("id", params.id);

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Error approving message:", err);
          return new Response(JSON.stringify({ error: "Failed to approve message" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
