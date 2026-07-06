import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/comments/approved")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabase.rpc("get_approved_messages");

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ comments: data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Error fetching approved comments:", err);
          return new Response(JSON.stringify({ error: "Failed to fetch comments" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
