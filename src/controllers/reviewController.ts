import type { Request, Response } from "express";
import { ReviewService } from "../services/reviewService.ts";
import { getValidated } from "../middlewares/validate.ts";
import { getAuthUser } from "../middlewares/auth.ts";
import type { IdParam } from "../schemas/commonSchema.ts";
import type { CreateReviewInput } from "../schemas/reviewSchema.ts";

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService = new ReviewService()) {
    this.reviewService = reviewService;
  }

  // POST /stalls/:id/reviews
  // stallId dari path, userId dari token (bukan dari request body).
  createReview = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<IdParam>(res, "params");
    const body = getValidated<CreateReviewInput>(res, "body");
    const user = getAuthUser(res);
    const review = await this.reviewService.createReview({
      stallId: id,
      userId: user.id,
      rating: body.rating,
      comment: body.comment,
    });
    res.status(201).json({ status: "success", data: review });
  };
}
