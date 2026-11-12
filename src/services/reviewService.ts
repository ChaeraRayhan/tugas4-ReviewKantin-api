import { ReviewRepository } from "../repositories/reviewRepository.ts";
import { StallRepository } from "../repositories/stallRepository.ts";
import type { ReviewResponseDto } from "../dtos/reviewDto.ts";
import { AppError } from "../errors/AppError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import type { reviews } from "../db/schema.ts";

type ReviewRow = typeof reviews.$inferSelect;

export interface CreateReviewData {
  stallId: number; // dari path
  userId: number; // dari token
  rating: number;
  comment?: string | null;
}

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private stallRepository: StallRepository;

  constructor(
    reviewRepository: ReviewRepository = new ReviewRepository(),
    stallRepository: StallRepository = new StallRepository(),
  ) {
    this.reviewRepository = reviewRepository;
    this.stallRepository = stallRepository;
  }

  private toDto(row: ReviewRow): ReviewResponseDto {
    return {
      id: row.id,
      stallId: row.stallId,
      userId: row.userId,
      rating: row.rating,
      comment: row.comment,
      likeCount: row.likeCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createReview(input: CreateReviewData): Promise<ReviewResponseDto> {
    const stall = await this.stallRepository.findById(input.stallId);
    if (!stall) throw new NotFoundError("Warung tidak ditemukan");

    const row = await this.reviewRepository.create(input);
    if (!row) throw new AppError(500, "Review gagal dibuat");
    return this.toDto(row);
  }
}
