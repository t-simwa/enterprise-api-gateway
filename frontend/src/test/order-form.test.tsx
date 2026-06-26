import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrderFormDialog } from "@/components/forms/order-form";
import { AuthProvider } from "@/lib/auth";

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe("OrderFormDialog", () => {
  it("renders dialog when open", () => {
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText("New order")).toBeInTheDocument();
    expect(screen.getByText("Create order")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <OrderFormDialog open={false} onOpenChange={vi.fn()} />,
    );
    expect(screen.queryByText("New order")).not.toBeInTheDocument();
  });

  it("shows validation error for empty customer name", async () => {
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    await userEvent.click(screen.getByText("Create order"));
    expect(screen.getByText(/Customer name is required/i)).toBeInTheDocument();
  });

  it("shows Cancel button that calls onOpenChange(false)", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={onClose} />,
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("has customer name input and email input", () => {
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(
      screen.getByPlaceholderText(/e\.g\. Acme Inc/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/orders@example/i),
    ).toBeInTheDocument();
  });

  it("has Add item button", () => {
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText(/Add item/i)).toBeInTheDocument();
  });

  it("has product select placeholder", () => {
    renderWithProviders(
      <OrderFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText("Select product")).toBeInTheDocument();
  });
});
