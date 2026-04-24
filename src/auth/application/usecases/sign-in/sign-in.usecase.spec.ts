import { SignInUsecase } from './sign-in.usecase';
import { IAuthProvider } from '@auth/domain/providers/auth.provider';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import { Either } from '@shared/either';
import { InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import { InvalidCredentialsError, UserNotConfirmedError, UserNotFoundError } from '@auth/domain/errors';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'SecurePass123';
const makeTokens = () => new AuthTokens({
    access_token: 'access-token',
    id_token: 'id-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
});

const makeAuthProvider = (): jest.Mocked<IAuthProvider> => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    confirmSignUp: jest.fn(),
    refreshToken: jest.fn(),
});

describe('SignInUsecase', () => {
    let usecase: SignInUsecase;
    let authProvider: jest.Mocked<IAuthProvider>;

    beforeEach(() => {
        authProvider = makeAuthProvider();
        usecase = new SignInUsecase(authProvider);
    });

    it('deve autenticar e retornar os tokens', async () => {
        authProvider.signIn.mockResolvedValue(Either.ok(makeTokens()));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.ok).toBeInstanceOf(AuthTokens);
        expect(output.ok.access_token).toBe('access-token');
        expect(authProvider.signIn).toHaveBeenCalledWith(VALID_EMAIL, VALID_PASSWORD);
    });

    it('deve normalizar o email antes de chamar o provider', async () => {
        authProvider.signIn.mockResolvedValue(Either.ok(makeTokens()));

        await usecase.execute({ email: '  User@Example.COM  ', password: VALID_PASSWORD });

        expect(authProvider.signIn).toHaveBeenCalledWith('user@example.com', VALID_PASSWORD);
    });

    it('deve falhar com email inválido', async () => {
        const output = await usecase.execute({ email: 'not-an-email', password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(InvalidEmailError);
        expect(authProvider.signIn).not.toHaveBeenCalled();
    });

    it('deve falhar com senha muito curta', async () => {
        const output = await usecase.execute({ email: VALID_EMAIL, password: '123' });

        expect(output.error).toBeInstanceOf(InvalidPasswordError);
        expect(authProvider.signIn).not.toHaveBeenCalled();
    });

    it('deve falhar com credenciais inválidas', async () => {
        authProvider.signIn.mockResolvedValue(Either.fail(new InvalidCredentialsError()));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(InvalidCredentialsError);
    });

    it('deve falhar quando o usuário não confirmou o cadastro', async () => {
        authProvider.signIn.mockResolvedValue(Either.fail(new UserNotConfirmedError()));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(UserNotConfirmedError);
    });

    it('deve falhar quando o usuário não existe', async () => {
        authProvider.signIn.mockResolvedValue(Either.fail(new UserNotFoundError()));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(UserNotFoundError);
    });
});
