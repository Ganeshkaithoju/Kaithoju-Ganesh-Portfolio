import { createFileRoute } from "@tanstack/react-router";
import {
  verifyOwnerCredentials,
  createOwnerSessionCookie,
  OwnerAuthConfigError,
} from "@/lib/owner-auth.server";

interface LoginRequest {
  email?: string;
  password?: string;
}

export const Route = createFileRoute("/api/owner/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as LoginRequest;
          const { email, password } = body;

          if (!email || !password) {
            return new Response(JSON.stringify({ error: "Email and password required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Verify credentials against database
          const normalizedEmail = email.trim().toLowerCase();
          const isValid = await verifyOwnerCredentials(normalizedEmail, password);

          if (!isValid) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Create session cookie
          const cookie = createOwnerSessionCookie(normalizedEmail, request);

          return new Response(JSON.stringify({ success: true, email: normalizedEmail }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": cookie,
            },
          });
        } catch (err) {
          if (err instanceof OwnerAuthConfigError) {
            console.error(err.message);
            return new Response(
              JSON.stringify({
                error:
                  "Owner dashboard is unavailable on this server because backend credentials are not configured.",
              }),
              { status: 503, headers: { "Content-Type": "application/json" } },
            );
          }
          console.error("Login error:", err);
          return new Response(JSON.stringify({ error: "Login failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
