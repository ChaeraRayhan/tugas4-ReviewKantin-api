import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { menuItems, stalls } from '../db/schema.ts';

export interface CreateMenuItemRow {
  stallId: number;
  name: string;
  price: number;
  isAvailable?: boolean;
}

const menuWithStall = {
  menu: menuItems,
  stall: {
    id: stalls.id,
    name: stalls.name,
    category: stalls.category,
    location: stalls.location,
  },
};

export class MenuItemRepository {
  async findByStallId(stallId: number) {
    const db = await getDb();
    return db.select().from(menuItems).where(eq(menuItems.stallId, stallId));
  }

  async findAllWithStall() {
    const db = await getDb();
    return db
      .select(menuWithStall)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .orderBy(menuItems.id);
  }

  async findByIdWithStall(id: number) {
    const db = await getDb();
    const rows = await db
      .select(menuWithStall)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .where(eq(menuItems.id, id));
    return rows[0];
  }

  async create(input: CreateMenuItemRow) {
    const db = await getDb();
    const rows = await db
      .insert(menuItems)
      .output()
      .values({
        stallId: input.stallId,
        name: input.name,
        price: input.price,
        isAvailable: input.isAvailable ?? true,
      });
    return rows[0];
  }

  async update(id: number, input: Partial<CreateMenuItemRow>) {
    const db = await getDb();
    const rows = await db
      .update(menuItems)
      .set({
        ...(input.stallId !== undefined ? { stallId: input.stallId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      })
      .where(eq(menuItems.id, id))
      .output();
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(menuItems).where(eq(menuItems.id, id)).output();
    return rows[0];
  }
}
