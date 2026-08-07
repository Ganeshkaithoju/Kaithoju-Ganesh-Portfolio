import { createFileRoute } from "@tanstack/react-router";
import { verifySecurityAnswers } from "@/lib/security-questions.server";
import { createOwnerSessionCookie } from "@/lib/owner-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface ResetPasswordRequest {
  email?: string;
  answer1?: string;
  answer2?: string;
}

export const Route = createFileRoute("/api/owner/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ResetPasswordRequest;
          const { email, answer1, answer2 } = body;

          if (!email || !answer1 || !answer2) {
            return new Response(
              JSON.stringify({ error: "Email and answers required" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Verify email exists in database
          const { data: adminUser, error: checkError } = await supabaseAdmin
            .from("admin_credentials")
            .select("email")
            .eq("email", email)
            .single();

          if (checkError || !adminUser) {
            return new Response(
              JSON.stringify({ error: "Invalid email" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Verify security answers
          if (!verifySecurityAnswers(answer1, answer2)) {
            return new Response(
              JSON.stringify({ error: "Incorrect answers" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Create session (successful password reset verification)
          const cookie = createOwnerSessionCookie(email, request);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Security answers verified. You can now update your password.",
              redirectTo: "/owner-dashboard" 
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookie,
              },
            }
          );
        } catch (err) {
          console.error("Reset password error:", err);
          return new Response(
            JSON.stringify({ error: "Reset failed" }),
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
