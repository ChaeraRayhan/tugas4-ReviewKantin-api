import type { UserResponseDto } from "./userDto.ts";

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}
