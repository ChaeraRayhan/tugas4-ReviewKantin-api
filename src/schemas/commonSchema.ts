import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id harus berupa angka" })
    .int("id harus bilangan bulat")
    .positive("id harus lebih dari 0")
    .openapi({ example: 1, description: "ID data" }),
});

export type IdParam = z.infer<typeof idParamSchema>;
