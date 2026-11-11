import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_AVATAR_BYTES, MAX_EMERGENCY_CONTACTS } from "@/lib/constants";
import { toISODate } from "@/lib/format";

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  relationship: z.string().trim().max(50, "Keep it under 50 characters"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
});

export const employeeSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().max(30, "Keep it under 30 characters"),
  job_title: z.string().trim().min(2, "Job title is required").max(120),
  department: z.string(), // "" means "no department"; ids come from <select> as strings
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"], { error: "Choose a status" }),
  hire_date: z
    .string()
    .min(1, "Hire date is required")
    .refine((value) => value <= toISODate(), "Hire date can't be in the future"), // YYYY-MM-DD compares correctly as text
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_AVATAR_BYTES, "Image must be 2 MB or smaller")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Use a JPG, PNG or WEBP image")
    .nullable(),
  emergency_contacts: z.array(emergencyContactSchema).max(MAX_EMERGENCY_CONTACTS, `Add at most ${MAX_EMERGENCY_CONTACTS} contacts`),
});

/** Fields per wizard step: used to validate one step at a time. */
export const EMPLOYEE_FORM_STEPS = [
  { id: "personal", title: "Personal details", fields: ["first_name", "last_name", "email", "phone"] },
  { id: "job", title: "Job details", fields: ["job_title", "department", "status", "hire_date"] },
  { id: "extras", title: "Photo & contacts", fields: ["avatar", "emergency_contacts"] },
];

export const EMPLOYEE_FIELD_NAMES = EMPLOYEE_FORM_STEPS.flatMap((step) => step.fields);

/** A function, not a constant, so "today" is computed when the form opens. */
export function getEmptyEmployeeValues() {
  return {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    status: "ACTIVE",
    hire_date: toISODate(),
    avatar: null,
    emergency_contacts: [],
  };
}

/** API employee → form values (nulls become "" so inputs stay controlled-safe). */
export function toEmployeeFormValues(employee) {
  return {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone ?? "",
    job_title: employee.job_title,
    department: employee.department ? String(employee.department) : "",
    status: employee.status,
    hire_date: employee.hire_date,
    avatar: null, // a NEW file only; the current photo is shown separately
    emergency_contacts: (employee.emergency_contacts ?? []).map((contact) => ({
      name: contact.name,
      relationship: contact.relationship ?? "",
      phone: contact.phone,
    })),
  };
}

/** Form values → multipart FormData matching the API contract (Phase 2.11). */
export function toEmployeeFormData(values) {
  const { avatar, emergency_contacts: contacts, ...fields } = values; // rest: everything else
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value ?? "");
  }
  formData.append("emergency_contacts", JSON.stringify(contacts)); // multipart can't nest, so send JSON text
  if (avatar instanceof File) formData.append("avatar", avatar); // only when a new image was chosen
  return formData;
}
