import { z } from "zod";

export const credentialsSignUpSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(200, "Password is too long."),
  name: z.string().min(1, "Name is required.").max(120, "Name is too long."),
});

export type CredentialsSignUpInput = z.infer<typeof credentialsSignUpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required.").max(200),
    newPassword: z.string().min(10, "New password must be at least 10 characters.").max(200),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
