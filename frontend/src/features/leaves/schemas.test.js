import { leaveRequestSchema } from "./schemas";

const validRequest = {
  leave_type: "ANNUAL",
  start_date: "2026-12-01",
  end_date: "2026-12-03",
  reason: "Family holiday abroad",
};

describe("leaveRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(leaveRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects an end date before the start date, and reports it on end_date", () => {
    const result = leaveRequestSchema.safeParse({ ...validRequest, end_date: "2026-11-30" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["end_date"]);
  });

  it("requires a meaningful reason", () => {
    const result = leaveRequestSchema.safeParse({ ...validRequest, reason: "trip" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Please give at least 10 characters");
  });
});
