import express, { type Application } from "express";
import { sql } from "drizzle-orm";
import swaggerUi from "swagger-ui-express";
import { getDb } from "./db/index.ts";
import { authRouter } from "./routes/authRouter.ts";
import { stallRouter } from "./routes/stallRouter.ts";
import { notFoundHandler } from "./middlewares/notFound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { openApiDocument } from "./docs/openapi.ts";

const app: Application = express();
const PORT: number = 3000;

app.use(express.json());

// Middleware CORS untuk komunikasi dengan Frontend React Vite
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Dokumentasi API OpenAPI 3.0 
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Health check endpoint
app.get("/health", async (_req, res) => {
  const db = await getDb();
  await db.execute(sql`SELECT 1 AS ok`);
  res
    .status(200)
    .json({ status: "success", message: "Server dan database terhubung" });
});

// Routing API v1
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/stalls", stallRouter);

// Fallback untuk path langsung /auth dan /stalls bila diperlukan
app.use("/auth", authRouter);
app.use("/stalls", stallRouter);

// 404 untuk rute yang tidak dikenal, lalu error handling terpusat
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server Tugas 4 berjalan di http://localhost:${PORT}`);
});
