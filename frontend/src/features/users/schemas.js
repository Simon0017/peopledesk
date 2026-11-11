import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

const baseUserSchema = z.object({
  email: z.email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(150)
    .regex(/^[\w.@+-]+$/, "Letters, numbers and @ . + - _ only"),
  first_name: z.string().trim().min(1, "First name is required").max(150),
  last_name: z.string().trim().min(1, "Last name is required").max(150),
  role: z.enum(["ADMIN", "HR", "EMPLOYEE"], { error: "Choose a role" }),
  phone: z.string().trim().max(30),
  is_active: z.boolean(),
});

/** Password is required when creating, optional ("keep current") when editing. */
export function makeUserSchema({ isEdit }) {
  return baseUserSchema.extend({
    password: isEdit
      ? z.string().refine((value) => value === "" || value.length >= MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
      : z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
  });
}

export const USER_FIELD_NAMES = ["email", "username", "first_name", "last_name", "role", "phone", "is_active", "password"];
