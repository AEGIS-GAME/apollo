import { Transform } from "class-transformer"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  readonly username!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password!: string
}
