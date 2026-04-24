import { Either } from '@shared/either';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import { IAuthProvider, RefreshTokenProviderError } from '@auth/domain/providers/auth.provider';

export interface RefreshTokenInput {
    refresh_token: string;
    email?: string;
}

export class RefreshTokenUsecase {
    constructor(private readonly authProvider: IAuthProvider) {}

    async execute(input: RefreshTokenInput): Promise<Either<AuthTokens, RefreshTokenProviderError>> {
        return this.authProvider.refreshToken(input.refresh_token, input.email);
    }
}
