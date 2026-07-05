import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardRedirect,
});

function AdminDashboardRedirect() {
  useEffect(() => {
    // Redirect to owner dashboard
    window.location.href = "/owner-dashboard";
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>Redirecting to owner dashboard...</p>
    </div>
  );
}
