import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be 10 characters or fewer")
    .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
});

export const DEPARTMENT_FIELD_NAMES = ["name", "code", "description"];
