import { createFileRoute } from "@tanstack/react-router";
import { clearOwnerSessionCookie } from "@/lib/owner-auth.server";

export const Route = createFileRoute("/api/owner/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": clearOwnerSessionCookie(request),
          },
        });
      },
    },
  },
});
