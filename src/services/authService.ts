import { UserRepository } from "../repositories/userRepository.ts";
import type { UserResponseDto } from "../dtos/userDto.ts";
import type { LoginResponseDto } from "../dtos/authDto.ts";
import { AppError } from "../errors/AppError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import type { LoginInput, RegisterInput } from "../schemas/authSchema.ts";
import { hashPassword, verifyPassword } from "../utils/password.ts";
import { signToken } from "../utils/jwt.ts";
import type { users } from "../db/schema.ts";

type UserRow = typeof users.$inferSelect;

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  // passwordHash tidak ikut dikirim ke client.
  private toDto(row: UserRow): UserResponseDto {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
    };
  }

  // Role tidak diambil dari body: akun baru selalu "customer".
  async register(input: RegisterInput): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, "Email sudah terdaftar");

    const passwordHash = await hashPassword(input.password);
    const row = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "customer",
    });
    if (!row) throw new AppError(500, "User gagal dibuat");
    return this.toDto(row);
  }

  async login(input: LoginInput): Promise<LoginResponseDto> {
    const row = await this.userRepository.findByEmail(input.email);
    const valid = row ? await verifyPassword(input.password, row.passwordHash) : false;

    // Pesan sama untuk email salah maupun password salah.
    if (!row || !valid) throw new UnauthorizedError("Email atau password salah");

    const token = signToken({ id: row.id, role: row.role });
    return { token, user: this.toDto(row) };
  }

  async getMe(userId: number): Promise<UserResponseDto> {
    const row = await this.userRepository.findById(userId);
    if (!row) throw new UnauthorizedError("User tidak ditemukan");
    return this.toDto(row);
  }
}
