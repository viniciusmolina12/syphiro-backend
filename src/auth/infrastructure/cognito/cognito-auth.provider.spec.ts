import { CognitoAuthProvider } from './cognito-auth.provider';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotConfirmedError,
    UserNotFoundError,
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
} from '@auth/domain/errors';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
    SignUpCommand: jest.fn().mockImplementation(input => ({ input })),
    InitiateAuthCommand: jest.fn().mockImplementation(input => ({ input })),
    ConfirmSignUpCommand: jest.fn().mockImplementation(input => ({ input })),
    AuthFlowType: {
        USER_PASSWORD_AUTH: 'USER_PASSWORD_AUTH',
        REFRESH_TOKEN_AUTH: 'REFRESH_TOKEN_AUTH',
    },
}));

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'SecurePass123';
const VALID_CODE = '123456';
const VALID_REFRESH_TOKEN = 'valid-refresh-token';
const VALID_SUB = 'cognito-sub-id-123';

const makeAuthResult = () => ({
    AuthenticationResult: {
        AccessToken: 'access-token',
        IdToken: 'id-token',
        RefreshToken: 'new-refresh-token',
        ExpiresIn: 3600,
    },
});

describe('CognitoAuthProvider', () => {
    let provider: CognitoAuthProvider;

    beforeEach(() => {
        provider = new CognitoAuthProvider();
        mockSend.mockReset();
    });

    describe('signUp', () => {
        it('deve retornar o identity_id após cadastro bem-sucedido', async () => {
            mockSend.mockResolvedValue({ UserSub: VALID_SUB });

            const result = await provider.signUp(VALID_EMAIL, VALID_PASSWORD);

            expect(result.ok).toEqual({ identity_id: VALID_SUB });
        });

        it('deve retornar UserAlreadyExistsError quando o usuário já existe', async () => {
            const error = new Error('User already exists');
            error.name = 'UsernameExistsException';
            mockSend.mockRejectedValue(error);

            const result = await provider.signUp(VALID_EMAIL, VALID_PASSWORD);

            expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
        });

        it('deve relançar erros desconhecidos', async () => {
            mockSend.mockRejectedValue(new Error('Unknown error'));

            await expect(provider.signUp(VALID_EMAIL, VALID_PASSWORD)).rejects.toThrow('Unknown error');
        });
    });

    describe('signIn', () => {
        it('deve retornar AuthTokens após autenticação bem-sucedida', async () => {
            mockSend.mockResolvedValue(makeAuthResult());

            const result = await provider.signIn(VALID_EMAIL, VALID_PASSWORD);

            expect(result.ok).toBeInstanceOf(AuthTokens);
            expect(result.ok.access_token).toBe('access-token');
            expect(result.ok.id_token).toBe('id-token');
            expect(result.ok.refresh_token).toBe('new-refresh-token');
            expect(result.ok.expires_in).toBe(3600);
        });

        it('deve retornar InvalidCredentialsError para NotAuthorizedException', async () => {
            const error = new Error();
            error.name = 'NotAuthorizedException';
            mockSend.mockRejectedValue(error);

            const result = await provider.signIn(VALID_EMAIL, VALID_PASSWORD);

            expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        });

        it('deve retornar UserNotConfirmedError para UserNotConfirmedException', async () => {
            const error = new Error();
            error.name = 'UserNotConfirmedException';
            mockSend.mockRejectedValue(error);

            const result = await provider.signIn(VALID_EMAIL, VALID_PASSWORD);

            expect(result.error).toBeInstanceOf(UserNotConfirmedError);
        });

        it('deve retornar UserNotFoundError para UserNotFoundException', async () => {
            const error = new Error();
            error.name = 'UserNotFoundException';
            mockSend.mockRejectedValue(error);

            const result = await provider.signIn(VALID_EMAIL, VALID_PASSWORD);

            expect(result.error).toBeInstanceOf(UserNotFoundError);
        });
    });

    describe('confirmSignUp', () => {
        it('deve confirmar o cadastro com sucesso', async () => {
            mockSend.mockResolvedValue({});

            const result = await provider.confirmSignUp(VALID_EMAIL, VALID_CODE);

            expect(result.isOk()).toBe(true);
        });

        it('deve retornar InvalidConfirmationCodeError para CodeMismatchException', async () => {
            const error = new Error();
            error.name = 'CodeMismatchException';
            mockSend.mockRejectedValue(error);

            const result = await provider.confirmSignUp(VALID_EMAIL, VALID_CODE);

            expect(result.error).toBeInstanceOf(InvalidConfirmationCodeError);
        });

        it('deve retornar ExpiredConfirmationCodeError para ExpiredCodeException', async () => {
            const error = new Error();
            error.name = 'ExpiredCodeException';
            mockSend.mockRejectedValue(error);

            const result = await provider.confirmSignUp(VALID_EMAIL, VALID_CODE);

            expect(result.error).toBeInstanceOf(ExpiredConfirmationCodeError);
        });

        it('deve retornar UserNotFoundError para UserNotFoundException', async () => {
            const error = new Error();
            error.name = 'UserNotFoundException';
            mockSend.mockRejectedValue(error);

            const result = await provider.confirmSignUp(VALID_EMAIL, VALID_CODE);

            expect(result.error).toBeInstanceOf(UserNotFoundError);
        });
    });

    describe('refreshToken', () => {
        it('deve retornar novos tokens ao renovar com sucesso', async () => {
            mockSend.mockResolvedValue(makeAuthResult());

            const result = await provider.refreshToken(VALID_REFRESH_TOKEN);

            expect(result.ok).toBeInstanceOf(AuthTokens);
            expect(result.ok.access_token).toBe('access-token');
        });

        it('deve manter o refresh token original quando Cognito não retorna um novo', async () => {
            mockSend.mockResolvedValue({
                AuthenticationResult: {
                    AccessToken: 'access-token',
                    IdToken: 'id-token',
                    ExpiresIn: 3600,
                },
            });

            const result = await provider.refreshToken(VALID_REFRESH_TOKEN);

            expect(result.ok.refresh_token).toBe(VALID_REFRESH_TOKEN);
        });

        it('deve retornar InvalidCredentialsError para NotAuthorizedException', async () => {
            const error = new Error();
            error.name = 'NotAuthorizedException';
            mockSend.mockRejectedValue(error);

            const result = await provider.refreshToken(VALID_REFRESH_TOKEN);

            expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        });
    });
});
