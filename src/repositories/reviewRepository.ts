import { getDb } from '../db/index.ts';
import { reviews } from '../db/schema.ts';

export interface CreateReviewRow {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
}

export class ReviewRepository {
  async create(input: CreateReviewRow) {
    const db = await getDb();
    const rows = await db
      .insert(reviews)
      .output()
      .values({
        stallId: input.stallId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
        likeCount: 0,
      });
    return rows[0];
  }
}
