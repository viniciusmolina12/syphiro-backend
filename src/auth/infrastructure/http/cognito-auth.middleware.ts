import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { COGNITO_CONFIG } from '@auth/infrastructure/cognito/cognito.config';

const verifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_CONFIG.userPoolId,
    tokenUse: 'access',
    clientId: COGNITO_CONFIG.clientId,
});

@Injectable()
export class CognitoAuthMiddleware implements NestMiddleware {
    async use(req: { headers: Record<string, string | string[] | undefined> }, _res: unknown, next: () => void): Promise<void> {
        const auth_header = req.headers['authorization'] as string | undefined;
        if (!auth_header?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing authorization token');
        }

        const token = auth_header.slice(7);
        try {
            await verifier.verify(token);
            next();
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
