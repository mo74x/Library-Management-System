import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    // Decode the base64 credentials
    const b64auth = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(b64auth, 'base64')
      .toString()
      .split(':');

    const validUser = process.env.API_USER || 'admin';
    const validPass = process.env.API_PASS || 'bosta2026';

    if (username === validUser && password === validPass) {
      return true;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
