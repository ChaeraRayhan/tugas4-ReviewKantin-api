import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Kompatibilitas jika database masih berisi placeholder seed awal pertemuan-03 (hash_admin, hash_owner, dll)
  if (hash === "hash_admin" && (password === "rahasia123" || password === "password123" || password === "admin123")) {
    return true;
  }
  if (hash.startsWith("hash_") && (password === "rahasia123" || password === "password123")) {
    return true;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
