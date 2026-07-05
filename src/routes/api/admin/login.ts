import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async () => {
        return new Response(JSON.stringify({ error: "Admin login has been replaced with /api/owner/login" }), {
          status: 410,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
