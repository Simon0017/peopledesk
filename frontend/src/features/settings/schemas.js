import { z } from "zod";

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(150),
  last_name: z.string().trim().min(1, "Last name is required").max(150),
  phone: z.string().trim().max(30, "Keep it under 30 characters"),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ["confirm_password"],
    error: "Passwords don't match",
  })
  .refine((values) => values.new_password !== values.current_password, {
    path: ["new_password"],
    error: "Choose a password different from your current one",
  });
