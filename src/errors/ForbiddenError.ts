import { AppError } from "./AppError.ts";

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki akses") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}
