import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export interface CreateUserRow {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner' | 'customer';
}

export class UserRepository {
  async findByEmail(email: string) {
    const db = await getDb();
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0];
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async create(input: CreateUserRow) {
    const db = await getDb();
    const rows = await db.insert(users).output().values({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
    });
    return rows[0];
  }
}
