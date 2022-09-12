import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        // If there is a userId it returns true and allows access to specific route 
        return request.session.userId;
    }
}