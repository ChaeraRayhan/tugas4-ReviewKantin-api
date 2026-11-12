import { Router } from "express";
import { StallController } from "../controllers/stallController.ts";
import { ReviewController } from "../controllers/reviewController.ts";
import { validate } from "../middlewares/validate.ts";
import { authenticate, requireRole } from "../middlewares/auth.ts";
import {
  createStallSchema,
  idParamSchema,
  stallQuerySchema,
  updateStallSchema,
} from "../schemas/stallSchema.ts";
import { createReviewSchema } from "../schemas/reviewSchema.ts";

const stallRouter = Router();
const stallController = new StallController();
const reviewController = new ReviewController();

// Urutan middleware: authenticate (401) -> requireRole (403) -> validate (400) -> controller.

// ---- publik
stallRouter.get(
  "/",
  validate(stallQuerySchema, "query"),
  stallController.getStalls,
);
stallRouter.get(
  "/:id",
  validate(idParamSchema, "params"),
  stallController.getStallById,
);
stallRouter.get(
  "/:id/menus",
  validate(idParamSchema, "params"),
  stallController.getStallMenus,
);

// ---- owner, admin
stallRouter.post(
  "/",
  authenticate,
  requireRole("owner", "admin"),
  validate(createStallSchema, "body"),
  stallController.createStall,
);
// owner hanya boleh mengubah warung miliknya (dicek di service), admin bebas.
stallRouter.put(
  "/:id",
  authenticate,
  requireRole("owner", "admin"),
  validate(idParamSchema, "params"),
  validate(updateStallSchema, "body"),
  stallController.updateStall,
);

// ---- admin
stallRouter.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  stallController.deleteStall,
);

// ---- login (semua role)
stallRouter.post(
  "/:id/reviews",
  authenticate,
  validate(idParamSchema, "params"),
  validate(createReviewSchema, "body"),
  reviewController.createReview,
);

export { stallRouter };
