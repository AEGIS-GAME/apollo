import { Transform } from "class-transformer"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  readonly username!: string

  @IsString()
  @MinLength(8)
  readonly password!: string
}
