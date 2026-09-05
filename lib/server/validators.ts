import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10, "Valid 10-digit phone number is required").max(20),
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  otp: z.string().optional(),
});

// ─── Profile Schemas ─────────────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional(),
    currentPassword: z.string().max(128).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine(
    (data) => {
      // If newPassword is provided, currentPassword must also be provided
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }
  );

// ─── Type Exports ────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
