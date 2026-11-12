import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const createReviewSchema = z
  .object({
    rating: z
      .number({
        required_error: "rating wajib diisi",
        invalid_type_error: "rating harus berupa angka",
      })
      .int("rating harus bilangan bulat")
      .min(1, "rating minimal 1")
      .max(5, "rating maksimal 5")
      .openapi({ example: 5, description: "Rating 1-5" }),
    comment: z
      .string()
      .trim()
      .max(1000, "comment maksimal 1000 karakter")
      .optional()
      .openapi({ example: "Enak dan murah", description: "Komentar ulasan" }),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
