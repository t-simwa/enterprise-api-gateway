import { describe, it, expect } from "vitest";
import {
  formatUSD,
  formatNum,
  sparkSeries,
  type Product,
  type Order,
  type OrderCreateInput,
  type ProductCreateInput,
  type DashboardData,
  type LowStockItem,
  type InventoryRow,
} from "@/lib/api";

describe("api mock data generation", () => {
  it("formatUSD handles decimals", () => {
    expect(formatUSD(1234.56)).toBe("$1,235");
  });

  it("formatUSD handles large numbers", () => {
    expect(formatUSD(9_999_999)).toBe("$9,999,999");
  });

  it("formatUSD handles negative", () => {
    expect(formatUSD(-500)).toBe("-$500");
  });

  it("formatNum handles zero", () => {
    expect(formatNum(0)).toBe("0");
  });

  it("formatNum handles large number", () => {
    expect(formatNum(987654321)).toBe("987,654,321");
  });

  it("sparkSeries handles minimum seed", () => {
    const series = sparkSeries(0, 7);
    expect(series).toHaveLength(7);
    expect(series.every((v) => v >= 10)).toBe(true);
  });

  it("sparkSeries handles large seed", () => {
    const series = sparkSeries(9999, 30);
    expect(series).toHaveLength(30);
    expect(series.every((v) => v >= 10)).toBe(true);
  });

  it("sparkSeries of length 1", () => {
    const series = sparkSeries(42, 1);
    expect(series).toHaveLength(1);
  });

  it("formatUSD returns string type", () => {
    expect(typeof formatUSD(100)).toBe("string");
  });

  it("formatNum returns string type", () => {
    expect(typeof formatNum(100)).toBe("string");
  });

  it("formatUSD uses $ prefix", () => {
    expect(formatUSD(100)).toMatch(/^\$/);
  });
});
