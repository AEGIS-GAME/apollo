import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly username!: string

  @IsNotEmpty()
  @IsString()
  readonly password!: string

  @IsOptional()
  @IsBoolean()
  readonly admin?: boolean
}
