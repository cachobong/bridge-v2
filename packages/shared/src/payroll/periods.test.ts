import { describe, expect, it } from "vitest";
import { lastDayOfMonth, periodContaining, periodFor, periodsForMonth, periodsForYear } from "./periods.js";

describe("payroll periods", () => {
  it("first half is the 1st to the 15th", () => {
    expect(periodFor(2026, 3, 1)).toMatchObject({ startDate: "2026-03-01", endDate: "2026-03-15" });
  });

  it("second half is the 16th to the last day", () => {
    expect(periodFor(2026, 4, 2)).toMatchObject({ startDate: "2026-04-16", endDate: "2026-04-30" });
    expect(periodFor(2026, 12, 2)).toMatchObject({ startDate: "2026-12-16", endDate: "2026-12-31" });
  });

  it("handles February in leap and non-leap years", () => {
    expect(lastDayOfMonth(2024, 2)).toBe(29);
    expect(lastDayOfMonth(2026, 2)).toBe(28);
    expect(periodFor(2024, 2, 2).endDate).toBe("2024-02-29");
    expect(periodFor(2026, 2, 2).endDate).toBe("2026-02-28");
  });

  it("generates 2 periods per month and 24 per year", () => {
    expect(periodsForMonth(2026, 1)).toHaveLength(2);
    const year = periodsForYear(2026);
    expect(year).toHaveLength(24);
    expect(year[0]?.startDate).toBe("2026-01-01");
    expect(year[23]?.endDate).toBe("2026-12-31");
  });

  it("finds the period that contains a date", () => {
    expect(periodContaining("2026-10-15").half).toBe(1);
    expect(periodContaining("2026-10-16").half).toBe(2);
  });

  it("rejects an invalid month", () => {
    expect(() => periodFor(2026, 13, 1)).toThrow(RangeError);
  });
});
