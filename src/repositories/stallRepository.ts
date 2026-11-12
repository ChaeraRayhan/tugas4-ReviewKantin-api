import { and, count, eq, inArray, like, sql, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { stalls } from '../db/schema.ts';

export interface FindAllParams {
  search?: string;
  category?: string;
  page: number;
  limit: number;
}

export interface CreateStallInput {
  ownerId: number;
  name: string;
  category?: string | null;
  location?: string | null;
  description?: string | null;
}

const FOOD_CATEGORIES = [
  'makanan',
  'nasi',
  'kwetiau',
  'kwetiaw',
  'bakso',
  'soto',
  'western',
  'sate',
];
const SNACK_CATEGORIES = ['snack', 'camilan'];

export class StallRepository {
  async findAll(params: FindAllParams) {
    const db = await getDb();

    const conditions: SQL[] = [];
    if (params.search) conditions.push(like(stalls.name, `%${params.search}%`));
    if (params.category === 'Makanan') {
      conditions.push(
        inArray(sql`LOWER(LTRIM(RTRIM(${stalls.category})))`, FOOD_CATEGORIES),
      );
    } else if (params.category === 'Snack') {
      conditions.push(
        inArray(sql`LOWER(LTRIM(RTRIM(${stalls.category})))`, SNACK_CATEGORIES),
      );
    } else if (params.category) {
      conditions.push(eq(stalls.category, params.category));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (params.page - 1) * params.limit;

    // MSSQL: pagination memakai ORDER BY + OFFSET ... FETCH NEXT.
    const rows = await db
      .select()
      .from(stalls)
      .where(where)
      .orderBy(stalls.id)
      .offset(offset)
      .fetch(params.limit);

    const totals = await db.select({ total: count() }).from(stalls).where(where);

    return { rows, total: Number(totals[0]?.total ?? 0) };
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(stalls).where(eq(stalls.id, id));
    return rows[0];
  }

  async create(input: CreateStallInput) {
    const db = await getDb();
    const rows = await db
      .insert(stalls)
      .output()
      .values({
        ownerId: input.ownerId,
        name: input.name,
        category: input.category ?? null,
        location: input.location ?? null,
        description: input.description ?? null,
        avgRating: '0.00',
        reviewCount: 0,
      });
    return rows[0];
  }

  async update(id: number, input: Partial<CreateStallInput>) {
    const db = await getDb();

    const values = {
      ...(input.ownerId !== undefined ? { ownerId: input.ownerId } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    };

    if (Object.keys(values).length === 0) {
      return this.findById(id);
    }

    const rows = await db
      .update(stalls)
      .set(values)
      .where(eq(stalls.id, id))
      .output();
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(stalls).where(eq(stalls.id, id)).output();
    return rows[0];
  }
}
