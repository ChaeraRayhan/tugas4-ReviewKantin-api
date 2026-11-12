import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "name wajib diisi" })
      .trim()
      .min(3, "name minimal 3 karakter")
      .max(100, "name maksimal 100 karakter")
      .openapi({ example: "Rina Kusuma", description: "Nama pengguna" }),
    email: z
      .string({ required_error: "email wajib diisi" })
      .trim()
      .toLowerCase()
      .email("format email tidak valid")
      .max(150, "email maksimal 150 karakter")
      .openapi({ example: "rina@student.test", description: "Email (unik)" }),
    password: z
      .string({ required_error: "password wajib diisi" })
      .min(8, "password minimal 8 karakter")
      .max(72, "password maksimal 72 karakter")
      .openapi({ example: "rahasia123", description: "Password (disimpan sebagai hash)" }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "email wajib diisi" })
      .trim()
      .toLowerCase()
      .email("format email tidak valid")
      .openapi({ example: "rina@student.test", description: "Email terdaftar" }),
    password: z
      .string({ required_error: "password wajib diisi" })
      .min(1, "password wajib diisi")
      .openapi({ example: "rahasia123", description: "Password akun" }),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
