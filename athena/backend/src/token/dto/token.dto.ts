import { IsInt, IsNotEmpty } from "class-validator"

export class TokenDto {
  @IsInt()
  @IsNotEmpty()
  readonly sub!: number

  @IsInt()
  @IsNotEmpty()
  readonly iat!: number

  @IsInt()
  @IsNotEmpty()
  readonly exp!: number
}
