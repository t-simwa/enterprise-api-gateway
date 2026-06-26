import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductFormDialog } from "@/components/forms/product-form";
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

describe("ProductFormDialog", () => {
  it("renders dialog when open", () => {
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add product/i })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <ProductFormDialog open={false} onOpenChange={vi.fn()} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows validation error for empty SKU", async () => {
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(screen.getByText(/SKU is required/i)).toBeInTheDocument();
  });

  it("shows validation error for empty product name", async () => {
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    await userEvent.type(screen.getByPlaceholderText(/SKU-1001/i), "SKU-TEST");
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(screen.getByText(/Product name is required/i)).toBeInTheDocument();
  });

  it("shows validation error for missing unit price", async () => {
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    await userEvent.type(screen.getByPlaceholderText(/SKU-1001/i), "SKU-TEST");
    await userEvent.type(
      screen.getByPlaceholderText(/e\.g\. Titanium/i),
      "Test Product",
    );
    await userEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(
      screen.getByText(/Unit price must be greater than 0/i),
    ).toBeInTheDocument();
  });

  it("has all required input fields", () => {
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText(/SKU-1001/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. Titanium/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("29.99")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Hardware")).toBeInTheDocument();
  });

  it("has Cancel button", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ProductFormDialog open={true} onOpenChange={onClose} />,
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
