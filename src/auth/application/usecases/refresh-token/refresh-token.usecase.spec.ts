import { RefreshTokenUsecase } from './refresh-token.usecase';
import { IAuthProvider } from '@auth/domain/providers/auth.provider';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import { Either } from '@shared/either';
import { InvalidCredentialsError } from '@auth/domain/errors';

const VALID_REFRESH_TOKEN = 'valid-refresh-token';
const VALID_EMAIL = 'user@example.com';

const makeTokens = () => new AuthTokens({
    access_token: 'new-access-token',
    id_token: 'new-id-token',
    refresh_token: VALID_REFRESH_TOKEN,
    expires_in: 3600,
});

const makeAuthProvider = (): jest.Mocked<IAuthProvider> => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    confirmSignUp: jest.fn(),
    refreshToken: jest.fn(),
});

describe('RefreshTokenUsecase', () => {
    let usecase: RefreshTokenUsecase;
    let authProvider: jest.Mocked<IAuthProvider>;

    beforeEach(() => {
        authProvider = makeAuthProvider();
        usecase = new RefreshTokenUsecase(authProvider);
    });

    it('deve retornar novos tokens ao renovar com sucesso', async () => {
        authProvider.refreshToken.mockResolvedValue(Either.ok(makeTokens()));

        const output = await usecase.execute({ refresh_token: VALID_REFRESH_TOKEN });

        expect(output.ok).toBeInstanceOf(AuthTokens);
        expect(output.ok.access_token).toBe('new-access-token');
        expect(authProvider.refreshToken).toHaveBeenCalledWith(VALID_REFRESH_TOKEN, undefined);
    });

    it('deve repassar o email ao provider quando informado', async () => {
        authProvider.refreshToken.mockResolvedValue(Either.ok(makeTokens()));

        await usecase.execute({ refresh_token: VALID_REFRESH_TOKEN, email: VALID_EMAIL });

        expect(authProvider.refreshToken).toHaveBeenCalledWith(VALID_REFRESH_TOKEN, VALID_EMAIL);
    });

    it('deve falhar com refresh token inválido', async () => {
        authProvider.refreshToken.mockResolvedValue(Either.fail(new InvalidCredentialsError()));

        const output = await usecase.execute({ refresh_token: 'invalid-token' });

        expect(output.error).toBeInstanceOf(InvalidCredentialsError);
    });
});
