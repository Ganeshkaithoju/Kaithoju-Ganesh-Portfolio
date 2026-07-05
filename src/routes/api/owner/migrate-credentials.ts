import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface MigrateRequest {
  email?: string;
  password?: string;
}

export const Route = createFileRoute("/api/owner/migrate-credentials")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as MigrateRequest;
          const { email, password } = body;

          if (!email || !password) {
            return new Response(
              JSON.stringify({ error: "Email and password required" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Hash the password using bcrypt
          const passwordHash = await bcrypt.hash(password, 10);

          // Insert or update credentials in database
          const { data, error } = await supabaseAdmin
            .from("admin_credentials")
            .upsert(
              {
                email,
                password_hash: passwordHash,
              },
              { onConflict: "email" }
            )
            .select();

          if (error) {
            console.error("Database error:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Credentials migrated to database successfully",
              email: email,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err) {
          console.error("Migration error:", err);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Migration failed",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
