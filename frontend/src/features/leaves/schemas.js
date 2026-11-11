import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    leave_type: z.enum(["ANNUAL", "SICK", "UNPAID", "OTHER"], { error: "Choose a leave type" }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    reason: z.string().trim().min(10, "Please give at least 10 characters").max(500, "Keep it under 500 characters"),
  })
  // Cross-field rule: runs after the individual fields pass. `path` attaches the error to end_date.
  .refine((values) => values.end_date >= values.start_date, {
    path: ["end_date"],
    error: "End date must be on or after the start date",
  });

export const LEAVE_FIELD_NAMES = ["leave_type", "start_date", "end_date", "reason"];

export const reviewSchema = z.object({
  review_note: z.string().trim().max(500, "Keep it under 500 characters"),
});
