import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    ConfirmSignUpCommand,
    AuthFlowType,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import { Either } from '@shared/either';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import {
    IAuthProvider,
    SignUpResult,
    SignUpProviderError,
    SignInProviderError,
    ConfirmSignUpProviderError,
    RefreshTokenProviderError,
} from '@auth/domain/providers/auth.provider';
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotConfirmedError,
    UserNotFoundError,
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
} from '@auth/domain/errors';
import { COGNITO_CONFIG } from './cognito.config';

export class CognitoAuthProvider implements IAuthProvider {
    private readonly client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });
    }

    private computeSecretHash(username: string): string | undefined {
        if (!COGNITO_CONFIG.clientSecret) return undefined;
        return createHmac('sha256', COGNITO_CONFIG.clientSecret)
            .update(username + COGNITO_CONFIG.clientId)
            .digest('base64');
    }

    async signUp(email: string, password: string, name: string): Promise<Either<SignUpResult, SignUpProviderError>> {
        try {
            const response = await this.client.send(
                new SignUpCommand({
                    Username: email,
                    ClientId: COGNITO_CONFIG.clientId,
                    SecretHash: this.computeSecretHash(email),
                    Password: password,
                    UserAttributes: [
                        {
                            Name: 'email',
                            Value: email,
                        },
            
                        {
                            Name: 'name',
                            Value: name,
                        }
                    ],
                }),
            );

            // await this.client.send(
            //     new AdminSetUserPasswordCommand({
            //         UserPoolId: COGNITO_CONFIG.userPoolId,
            //         Username: email,
            //         Password: password,
            //         Permanent: true,
            //     }),
            // );
            return Either.ok({ identity_id: response.UserSub! });
        } catch (error: any) {
            if (error.name === 'UsernameExistsException') {
                return Either.fail(new UserAlreadyExistsError());
            }
            throw error;
        }
    }

    async signIn(email: string, password: string): Promise<Either<AuthTokens, SignInProviderError>> {
        try {
            const response = await this.client.send(
                new InitiateAuthCommand({
                    ClientId: COGNITO_CONFIG.clientId,
                    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                    AuthParameters: {
                        USERNAME: email,
                        PASSWORD: password,
                        ...(this.computeSecretHash(email) && { SECRET_HASH: this.computeSecretHash(email) }),
                    },
                }),
            );

            const result = response.AuthenticationResult!;
            return Either.ok(
                new AuthTokens({
                    access_token: result.AccessToken!,
                    id_token: result.IdToken!,
                    refresh_token: result.RefreshToken!,
                    expires_in: result.ExpiresIn!,
                }),
            );
        } catch (error: any) {
            if (error.name === 'NotAuthorizedException') return Either.fail(new InvalidCredentialsError());
            if (error.name === 'UserNotConfirmedException') return Either.fail(new UserNotConfirmedError());
            if (error.name === 'UserNotFoundException') return Either.fail(new UserNotFoundError());
            throw error;
        }
    }

    async confirmSignUp(email: string, code: string): Promise<Either<void, ConfirmSignUpProviderError>> {
        try {
            await this.client.send(
                new ConfirmSignUpCommand({
                    ClientId: COGNITO_CONFIG.clientId,
                    Username: email,
                    ConfirmationCode: code,
                    SecretHash: this.computeSecretHash(email),
                }),
            );
            return Either.ok(void 0);
        } catch (error: any) {
            if (error.name === 'CodeMismatchException') return Either.fail(new InvalidConfirmationCodeError());
            if (error.name === 'ExpiredCodeException') return Either.fail(new ExpiredConfirmationCodeError());
            if (error.name === 'UserNotFoundException') return Either.fail(new UserNotFoundError());
            throw error;
        }
    }

    async refreshToken(
        refresh_token: string,
        email?: string,
    ): Promise<Either<AuthTokens, RefreshTokenProviderError>> {
        try {
            const response = await this.client.send(
                new InitiateAuthCommand({
                    ClientId: COGNITO_CONFIG.clientId,
                    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
                    AuthParameters: {
                        REFRESH_TOKEN: refresh_token,
                        ...(email && this.computeSecretHash(email) && {
                            SECRET_HASH: this.computeSecretHash(email),
                        }),
                    },
                }),
            );

            const result = response.AuthenticationResult!;
            return Either.ok(
                new AuthTokens({
                    access_token: result.AccessToken!,
                    id_token: result.IdToken!,
                    refresh_token: result.RefreshToken ?? refresh_token,
                    expires_in: result.ExpiresIn!,
                }),
            );
        } catch (error: any) {
            if (error.name === 'NotAuthorizedException') return Either.fail(new InvalidCredentialsError());
            throw error;
        }
    }
}
