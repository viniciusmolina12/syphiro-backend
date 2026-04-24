import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SignUpUsecase } from '@auth/application/usecases/sign-up/sign-up.usecase';
import { SignInUsecase } from '@auth/application/usecases/sign-in/sign-in.usecase';
import { ConfirmSignUpUsecase } from '@auth/application/usecases/confirm-sign-up/confirm-sign-up.usecase';
import { RefreshTokenUsecase } from '@auth/application/usecases/refresh-token/refresh-token.usecase';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import { Either } from '@shared/either';
import { InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import {
    UserAlreadyExistsError,
    InvalidCredentialsError,
    UserNotConfirmedError,
    UserNotFoundError,
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
} from '@auth/domain/errors';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'SecurePass123';
const VALID_CODE = '123456';
const VALID_REFRESH_TOKEN = 'valid-refresh-token';
const VALID_IDENTITY_ID = 'cognito|abc-123';

const makeTokens = () => new AuthTokens({
    access_token: 'access-token',
    id_token: 'id-token',
    refresh_token: VALID_REFRESH_TOKEN,
    expires_in: 3600,
});

describe('AuthController', () => {
    let controller: AuthController;
    let signUpUsecase: jest.Mocked<Pick<SignUpUsecase, 'execute'>>;
    let signInUsecase: jest.Mocked<Pick<SignInUsecase, 'execute'>>;
    let confirmSignUpUsecase: jest.Mocked<Pick<ConfirmSignUpUsecase, 'execute'>>;
    let refreshTokenUsecase: jest.Mocked<Pick<RefreshTokenUsecase, 'execute'>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: SignUpUsecase, useValue: { execute: jest.fn() } },
                { provide: SignInUsecase, useValue: { execute: jest.fn() } },
                { provide: ConfirmSignUpUsecase, useValue: { execute: jest.fn() } },
                { provide: RefreshTokenUsecase, useValue: { execute: jest.fn() } },
            ],
        }).compile();

        controller = module.get(AuthController);
        signUpUsecase = module.get(SignUpUsecase);
        signInUsecase = module.get(SignInUsecase);
        confirmSignUpUsecase = module.get(ConfirmSignUpUsecase);
        refreshTokenUsecase = module.get(RefreshTokenUsecase);
    });

    describe('POST /auth/sign-up', () => {
        it('deve retornar o identity_id após cadastro bem-sucedido', async () => {
            signUpUsecase.execute.mockResolvedValue(Either.ok({ identity_id: VALID_IDENTITY_ID }));

            const result = await controller.signUp({ email: VALID_EMAIL, password: VALID_PASSWORD });

            expect(result).toEqual({ identity_id: VALID_IDENTITY_ID });
        });

        it('deve lançar BadRequestException para email inválido', async () => {
            signUpUsecase.execute.mockResolvedValue(Either.fail(new InvalidEmailError()));

            await expect(
                controller.signUp({ email: 'invalid', password: VALID_PASSWORD }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('deve lançar BadRequestException para senha inválida', async () => {
            signUpUsecase.execute.mockResolvedValue(Either.fail(new InvalidPasswordError('too short')));

            await expect(
                controller.signUp({ email: VALID_EMAIL, password: '123' }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('deve lançar ConflictException quando usuário já existe', async () => {
            signUpUsecase.execute.mockResolvedValue(Either.fail(new UserAlreadyExistsError()));

            await expect(
                controller.signUp({ email: VALID_EMAIL, password: VALID_PASSWORD }),
            ).rejects.toBeInstanceOf(ConflictException);
        });
    });

    describe('POST /auth/sign-in', () => {
        it('deve retornar tokens após autenticação bem-sucedida', async () => {
            signInUsecase.execute.mockResolvedValue(Either.ok(makeTokens()));

            const result = await controller.signIn({ email: VALID_EMAIL, password: VALID_PASSWORD });

            expect(result).toBeInstanceOf(AuthTokens);
        });

        it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
            signInUsecase.execute.mockResolvedValue(Either.fail(new InvalidCredentialsError()));

            await expect(
                controller.signIn({ email: VALID_EMAIL, password: VALID_PASSWORD }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('deve lançar ForbiddenException quando usuário não confirmou o cadastro', async () => {
            signInUsecase.execute.mockResolvedValue(Either.fail(new UserNotConfirmedError()));

            await expect(
                controller.signIn({ email: VALID_EMAIL, password: VALID_PASSWORD }),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        it('deve lançar NotFoundException quando usuário não existe', async () => {
            signInUsecase.execute.mockResolvedValue(Either.fail(new UserNotFoundError()));

            await expect(
                controller.signIn({ email: VALID_EMAIL, password: VALID_PASSWORD }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('POST /auth/confirm', () => {
        it('deve confirmar o cadastro com sucesso', async () => {
            confirmSignUpUsecase.execute.mockResolvedValue(Either.ok(void 0));

            await expect(
                controller.confirmSignUp({ email: VALID_EMAIL, code: VALID_CODE }),
            ).resolves.toBeUndefined();
        });

        it('deve lançar BadRequestException para código inválido', async () => {
            confirmSignUpUsecase.execute.mockResolvedValue(Either.fail(new InvalidConfirmationCodeError()));

            await expect(
                controller.confirmSignUp({ email: VALID_EMAIL, code: '000000' }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('deve lançar BadRequestException para código expirado', async () => {
            confirmSignUpUsecase.execute.mockResolvedValue(Either.fail(new ExpiredConfirmationCodeError()));

            await expect(
                controller.confirmSignUp({ email: VALID_EMAIL, code: VALID_CODE }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('POST /auth/refresh', () => {
        it('deve retornar novos tokens ao renovar com sucesso', async () => {
            refreshTokenUsecase.execute.mockResolvedValue(Either.ok(makeTokens()));

            const result = await controller.refreshToken({ refresh_token: VALID_REFRESH_TOKEN });

            expect(result).toBeInstanceOf(AuthTokens);
        });

        it('deve lançar UnauthorizedException para refresh token inválido', async () => {
            refreshTokenUsecase.execute.mockResolvedValue(Either.fail(new InvalidCredentialsError()));

            await expect(
                controller.refreshToken({ refresh_token: 'invalid' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
