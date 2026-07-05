import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ error: "Admin endpoints have been replaced. Use /api/owner/stats instead" }), {
          status: 410,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
