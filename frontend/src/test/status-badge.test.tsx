import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui-bits/status-badge";

describe("StatusBadge", () => {
  it("renders pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders delivered status", () => {
    render(<StatusBadge status="delivered" />);
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("cancelled")).toBeInTheDocument();
  });

  it("renders processing status", () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText("processing")).toBeInTheDocument();
  });

  it("renders active status", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders inactive status", () => {
    render(<StatusBadge status="inactive" />);
    expect(screen.getByText("inactive")).toBeInTheDocument();
  });

  it("falls back to inactive for unknown status", () => {
    render(<StatusBadge status="unknown_status_xyz" />);
    expect(screen.getByText("unknown_status_xyz")).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<StatusBadge status="shipped" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});
