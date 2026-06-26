import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth, type User } from "@/lib/auth";

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? `Logged in as ${user?.email}` : "Not logged in"}
      </span>
      <button data-testid="login-btn" onClick={() => login("test@test.com", "pw")}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts as not authenticated", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not logged in");
  });

  it("useAuth throws outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider",
    );
    spy.mockRestore();
  });

  it("logout clears auth state", async () => {
    localStorage.setItem(
      "eag.auth.v1",
      JSON.stringify({
        user: { id: "1", email: "test@test.com", role: "admin" },
        accessToken: "tok",
      }),
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByTestId("logout-btn"));
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not logged in");
    expect(localStorage.getItem("eag.auth.v1")).toBeNull();
  });

  it("restores session from localStorage", () => {
    const mockUser: User = {
      id: "saved-id",
      email: "saved@test.com",
      full_name: "Saved User",
      role: "manager",
    };
    localStorage.setItem(
      "eag.auth.v1",
      JSON.stringify({ user: mockUser, accessToken: "saved-token" }),
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Logged in as saved@test.com",
    );
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("eag.auth.v1", "{not valid json}");
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not logged in");
  });
});
