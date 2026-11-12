import { AppError } from "./AppError.ts";

export class UnauthorizedError extends AppError {
  constructor(message = "Anda belum terautentikasi") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
