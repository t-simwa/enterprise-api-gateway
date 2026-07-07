import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Gateway" }] }),
  component: () => <Navigate to="/" replace />,
});
