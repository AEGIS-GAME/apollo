import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class UserDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id!: number

  @IsNotEmpty()
  @IsString()
  readonly username!: string

  @IsNotEmpty()
  @IsString()
  readonly password_hash!: string

  @IsOptional()
  @IsBoolean()
  readonly is_admin!: boolean
}
