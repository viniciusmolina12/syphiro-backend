import { Either } from '@shared/either';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotConfirmedError,
    UserNotFoundError,
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
} from '@auth/domain/errors';

export interface SignUpResult {
    identity_id: string;
}

export type SignUpProviderError = UserAlreadyExistsError;
export type SignInProviderError = InvalidCredentialsError | UserNotConfirmedError | UserNotFoundError;
export type ConfirmSignUpProviderError = InvalidConfirmationCodeError | ExpiredConfirmationCodeError | UserNotFoundError;
export type RefreshTokenProviderError = InvalidCredentialsError;

export interface IAuthProvider {
    signUp(email: string, password: string, name: string): Promise<Either<SignUpResult, SignUpProviderError>>;
    signIn(email: string, password: string): Promise<Either<AuthTokens, SignInProviderError>>;
    confirmSignUp(email: string, code: string): Promise<Either<void, ConfirmSignUpProviderError>>;
    refreshToken(refresh_token: string, email?: string): Promise<Either<AuthTokens, RefreshTokenProviderError>>;
}
