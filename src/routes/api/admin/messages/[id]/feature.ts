import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/messages/id/feature")({
  server: {
    handlers: {
      POST: async () => {
        return new Response(JSON.stringify({ error: "Admin endpoints have been replaced. Use /api/owner/messages/:id/feature instead" }), {
          status: 410,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
