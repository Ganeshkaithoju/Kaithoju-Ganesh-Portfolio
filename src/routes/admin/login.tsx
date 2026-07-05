import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginRedirect,
});

function AdminLoginRedirect() {
  useEffect(() => {
    // Redirect to owner login
    window.location.href = "/owner-login";
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>Redirecting to owner login...</p>
    </div>
  );
}
