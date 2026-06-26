import { describe, it, expect } from "vitest";
import { formatUSD, formatNum, sparkSeries } from "@/lib/api";

describe("formatUSD", () => {
  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0");
  });

  it("formats whole numbers", () => {
    expect(formatUSD(50000)).toBe("$50,000");
  });
});

describe("formatNum", () => {
  it("formats with commas", () => {
    expect(formatNum(1234567)).toBe("1,234,567");
  });

  it("formats zero", () => {
    expect(formatNum(0)).toBe("0");
  });
});

describe("sparkSeries", () => {
  it("returns array of correct length", () => {
    expect(sparkSeries(42, 14)).toHaveLength(14);
  });

  it("all values are positive", () => {
    expect(sparkSeries(42, 30).every((v) => v > 0)).toBe(true);
  });

  it("is deterministic for same seed", () => {
    expect(sparkSeries(7, 10)).toEqual(sparkSeries(7, 10));
  });
});
