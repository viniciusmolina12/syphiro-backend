import { Module } from '@nestjs/common';
import { CognitoAuthProvider } from '@auth/infrastructure/cognito/cognito-auth.provider';
import { SignUpUsecase } from '@auth/application/usecases/sign-up/sign-up.usecase';
import { SignInUsecase } from '@auth/application/usecases/sign-in/sign-in.usecase';
import { ConfirmSignUpUsecase } from '@auth/application/usecases/confirm-sign-up/confirm-sign-up.usecase';
import { RefreshTokenUsecase } from '@auth/application/usecases/refresh-token/refresh-token.usecase';
import { IAuthProvider } from '@auth/domain/providers/auth.provider';
import { AuthController } from './auth.controller';

const AUTH_PROVIDER_TOKEN = 'IAuthProvider';

@Module({
    providers: [
        {
            provide: AUTH_PROVIDER_TOKEN,
            useClass: CognitoAuthProvider,
        },
        {
            provide: SignUpUsecase,
            useFactory: (provider: IAuthProvider) => new SignUpUsecase(provider),
            inject: [AUTH_PROVIDER_TOKEN],
        },
        {
            provide: SignInUsecase,
            useFactory: (provider: IAuthProvider) => new SignInUsecase(provider),
            inject: [AUTH_PROVIDER_TOKEN],
        },
        {
            provide: ConfirmSignUpUsecase,
            useFactory: (provider: IAuthProvider) => new ConfirmSignUpUsecase(provider),
            inject: [AUTH_PROVIDER_TOKEN],
        },
        {
            provide: RefreshTokenUsecase,
            useFactory: (provider: IAuthProvider) => new RefreshTokenUsecase(provider),
            inject: [AUTH_PROVIDER_TOKEN],
        },
    ],
    controllers: [AuthController],
})
export class AuthModule {}
