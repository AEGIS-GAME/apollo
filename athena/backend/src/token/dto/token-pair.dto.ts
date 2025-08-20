import { IsNotEmpty, IsString, Matches } from "class-validator"

export class TokenPairDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
  readonly access!: string

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
  readonly refresh!: string
}
