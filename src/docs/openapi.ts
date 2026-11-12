import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z, type ZodTypeAny } from "zod";
import {
  idParamSchema,
  createStallSchema,
  stallQuerySchema,
  updateStallSchema,
} from "../schemas/stallSchema.ts";
import { registerSchema, loginSchema } from "../schemas/authSchema.ts";
import { createReviewSchema } from "../schemas/reviewSchema.ts";

const registry = new OpenAPIRegistry();

const dateExample = "2026-09-14T00:00:00.000Z";

// ------------------------------------------------------------ keamanan JWT
// Muncul sebagai tombol "Authorize" di Swagger UI.
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Isi dengan token dari POST /auth/login (tanpa kata 'Bearer').",
});
const secured = [{ bearerAuth: [] as string[] }];

// ----------------------------------------------------------------- schema
const stallSchema = registry.register(
  "Stall",
  z.object({
    id: z.number().openapi({ example: 1 }),
    ownerId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: "Warung Bu Tini" }),
    category: z.string().nullable().openapi({ example: "Kwetiau" }),
    location: z.string().nullable().openapi({ example: "Kantin FKIP" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Kedai kwetiau goreng & kuah" }),
    avgRating: z.number().openapi({ example: 4.5 }),
    reviewCount: z.number().openapi({ example: 2 }),
    isPopular: z.boolean().openapi({ example: false }),
  }),
);

const menuSchema = registry.register(
  "Menu",
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: "Kwetiau Goreng Spesial" }),
    price: z.number().openapi({ example: 15000 }),
    isAvailable: z.boolean().openapi({ example: true }),
  }),
);

const userSchema = registry.register(
  "User",
  z.object({
    id: z.number().openapi({ example: 12 }),
    name: z.string().openapi({ example: "Rina Kusuma" }),
    email: z.string().openapi({ example: "rina@student.test" }),
    role: z.enum(["admin", "owner", "customer"]).openapi({ example: "customer" }),
    createdAt: z.string().nullable().openapi({ example: dateExample }),
  }),
);

const reviewSchema = registry.register(
  "Review",
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 1 }),
    userId: z.number().openapi({ example: 12 }),
    rating: z.number().openapi({ example: 5 }),
    comment: z.string().nullable().openapi({ example: "Enak!" }),
    likeCount: z.number().openapi({ example: 0 }),
    createdAt: z.string().nullable().openapi({ example: dateExample }),
    updatedAt: z.string().nullable().openapi({ example: null }),
  }),
);

const loginResultSchema = registry.register(
  "LoginResult",
  z.object({
    token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
    user: userSchema,
  }),
);

const errorSchema = registry.register(
  "ErrorResponse",
  z.object({
    status: z.string().openapi({ example: "fail" }),
    message: z.string().openapi({ example: "Validasi gagal" }),
    errors: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional()
      .openapi({
        example: [
          { field: "name", message: "name minimal 3 karakter" },
          { field: "password", message: "password minimal 8 karakter" },
        ],
      }),
  }),
);

const registerInput = registry.register("RegisterInput", registerSchema);
const loginInput = registry.register("LoginInput", loginSchema);
const stallInput = registry.register("StallInput", createStallSchema);
const stallUpdate = registry.register("StallUpdate", updateStallSchema);
const reviewInput = registry.register("ReviewInput", createReviewSchema);

// ------------------------------------------------------- helper pembungkus
const success = <T extends ZodTypeAny>(data: T) =>
  z.object({ status: z.literal("success"), data });

const jsonResponse = (description: string, schema: ZodTypeAny) => ({
  description,
  content: { "application/json": { schema } },
});

const errorResponse = (description: string) =>
  jsonResponse(description, errorSchema);

const jsonBody = (description: string, schema: ZodTypeAny) => ({
  description,
  content: { "application/json": { schema } },
});

const unauthorized = errorResponse("Belum login atau token tidak valid/kedaluwarsa (401)");
const forbidden = errorResponse("Sudah login, tetapi tidak punya akses (403)");
const serverError = errorResponse("Kesalahan pada server (500)");

const stallListResponse = registry.register(
  "StallListResponse",
  z.object({
    status: z.literal("success"),
    meta: z.object({
      page: z.number().openapi({ example: 1 }),
      limit: z.number().openapi({ example: 10 }),
      total: z.number().openapi({ example: 10 }),
    }),
    data: z.array(stallSchema),
  }),
);
const stallDetailResponse = registry.register("StallDetailResponse", success(stallSchema));

// ------------------------------------------------------------------ routes
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Cek kesehatan server & database",
  responses: {
    200: jsonResponse(
      "Server dan database terhubung",
      z.object({ status: z.literal("success"), message: z.string() }),
    ),
    500: serverError,
  },
});

// AUTH
registry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  tags: ["Auth"],
  summary: "Registrasi akun baru (role otomatis customer)",
  request: { body: jsonBody("Data registrasi", registerInput) },
  responses: {
    201: jsonResponse("Akun berhasil dibuat", success(userSchema)),
    400: errorResponse("Validasi gagal"),
    409: errorResponse("Email sudah terdaftar"),
    500: serverError,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  summary: "Login dan dapatkan token JWT",
  request: { body: jsonBody("Email dan password", loginInput) },
  responses: {
    200: jsonResponse("Login berhasil", success(loginResultSchema)),
    400: errorResponse("Validasi gagal"),
    401: errorResponse("Email atau password salah"),
    500: serverError,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/auth/me",
  tags: ["Auth"],
  summary: "Profil user yang sedang login (semua role)",
  security: secured,
  responses: {
    200: jsonResponse("Data user dari token", success(userSchema)),
    401: unauthorized,
    500: serverError,
  },
});

// STALLS
registry.registerPath({
  method: "get",
  path: "/api/v1/stalls",
  tags: ["Stalls"],
  summary: "Daftar warung (publik)",
  description: "Daftar warung dengan filter `search`/`category` dan pagination.",
  request: { query: stallQuerySchema },
  responses: {
    200: jsonResponse("Daftar warung + meta pagination", stallListResponse),
    400: errorResponse("Query parameter tidak valid"),
    500: serverError,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/stalls/{id}",
  tags: ["Stalls"],
  summary: "Detail warung (publik)",
  request: { params: idParamSchema },
  responses: {
    200: jsonResponse("Detail warung", stallDetailResponse),
    400: errorResponse("Parameter id tidak valid"),
    404: errorResponse("Warung tidak ditemukan"),
    500: serverError,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/stalls/{id}/menus",
  tags: ["Stalls"],
  summary: "Daftar menu sebuah warung (publik)",
  request: { params: idParamSchema },
  responses: {
    200: jsonResponse("Daftar menu milik warung", success(z.array(menuSchema))),
    400: errorResponse("Parameter id tidak valid"),
    404: errorResponse("Warung tidak ditemukan"),
    500: serverError,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/stalls",
  tags: ["Stalls"],
  summary: "Tambah warung (owner, admin)",
  description: "Pemilik warung (ownerId) diambil dari token, bukan dari body.",
  security: secured,
  request: { body: jsonBody("Data warung baru", stallInput) },
  responses: {
    201: jsonResponse("Warung berhasil dibuat", stallDetailResponse),
    400: errorResponse("Validasi gagal"),
    401: unauthorized,
    403: forbidden,
    500: serverError,
  },
});

registry.registerPath({
  method: "put",
  path: "/api/v1/stalls/{id}",
  tags: ["Stalls"],
  summary: "Update warung (owner hanya miliknya, admin)",
  security: secured,
  request: {
    params: idParamSchema,
    body: jsonBody("Data warung yang diubah (boleh sebagian)", stallUpdate),
  },
  responses: {
    200: jsonResponse("Warung ter-update", stallDetailResponse),
    400: errorResponse("Validasi gagal"),
    401: unauthorized,
    403: forbidden,
    404: errorResponse("Warung tidak ditemukan"),
    500: serverError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/v1/stalls/{id}",
  tags: ["Stalls"],
  summary: "Hapus warung (admin)",
  security: secured,
  request: { params: idParamSchema },
  responses: {
    200: jsonResponse("Warung terhapus", stallDetailResponse),
    400: errorResponse("Validasi gagal"),
    401: unauthorized,
    403: forbidden,
    404: errorResponse("Warung tidak ditemukan"),
    500: serverError,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/stalls/{id}/reviews",
  tags: ["Stalls"],
  summary: "Tambah review pada warung (semua role yang login)",
  description: "Pengulas (userId) diambil dari token, bukan dari body.",
  security: secured,
  request: {
    params: idParamSchema,
    body: jsonBody("Data review", reviewInput),
  },
  responses: {
    201: jsonResponse("Review berhasil dibuat", success(reviewSchema)),
    400: errorResponse("Validasi gagal"),
    401: unauthorized,
    404: errorResponse("Warung tidak ditemukan"),
    409: errorResponse("Data bentrok (mis. sudah pernah mengulas warung ini)"),
    500: serverError,
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Review Kantin API",
    version: "2.0.0",
    description:
      "Dokumentasi OpenAPI 3.0 yang dibangkitkan otomatis dari schema zod. " +
      "Endpoint yang bertanda gembok memerlukan token JWT (tombol Authorize).",
  },
  servers: [{ url: "http://localhost:3000" }],
});
