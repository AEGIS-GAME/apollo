import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import { IS_PUBLIC_KEY } from "./decorators/public.decorator"

interface JwtPayload {
  sub: number
  iat?: number
  exp?: number
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException("Authorization header missing or malformed")
    }

    try {
      const accessSecret = this.configService.get<string>("JWT_ACCESS_SECRET")
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: accessSecret,
      })
      request.user = payload
    } catch {
      throw new UnauthorizedException("Invalid or expired token")
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
