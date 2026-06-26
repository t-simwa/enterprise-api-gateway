import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "./helpers";

// Simple rendering test — verifies test infra works
describe("test infrastructure", () => {
  it("renders a basic element", () => {
    render(<div data-testid="hello">Hello world</div>);
    expect(screen.getByTestId("hello")).toHaveTextContent("Hello world");
  });

  it("works with custom render helper", () => {
    renderWithProviders(<div data-testid="provider">In providers</div>);
    expect(screen.getByTestId("provider")).toBeInTheDocument();
  });
});
