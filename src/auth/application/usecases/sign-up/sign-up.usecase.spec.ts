import { SignUpUsecase } from './sign-up.usecase';
import { IAuthProvider, SignUpResult } from '@auth/domain/providers/auth.provider';
import { Either } from '@shared/either';
import { InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import { UserAlreadyExistsError } from '@auth/domain/errors';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'SecurePass123';
const VALID_IDENTITY_ID = 'cognito|abc-123-def-456';

const makeAuthProvider = (): jest.Mocked<IAuthProvider> => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    confirmSignUp: jest.fn(),
    refreshToken: jest.fn(),
});

describe('SignUpUsecase', () => {
    let usecase: SignUpUsecase;
    let authProvider: jest.Mocked<IAuthProvider>;

    beforeEach(() => {
        authProvider = makeAuthProvider();
        usecase = new SignUpUsecase(authProvider);
    });

    it('deve cadastrar o usuário com sucesso', async () => {
        const result: SignUpResult = { identity_id: VALID_IDENTITY_ID };
        authProvider.signUp.mockResolvedValue(Either.ok(result));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.ok).toEqual(result);
        expect(authProvider.signUp).toHaveBeenCalledWith(VALID_EMAIL, VALID_PASSWORD);
    });

    it('deve normalizar o email antes de chamar o provider', async () => {
        authProvider.signUp.mockResolvedValue(Either.ok({ identity_id: VALID_IDENTITY_ID }));

        await usecase.execute({ email: '  User@Example.COM  ', password: VALID_PASSWORD });

        expect(authProvider.signUp).toHaveBeenCalledWith('user@example.com', VALID_PASSWORD);
    });

    it('deve falhar com email inválido', async () => {
        const output = await usecase.execute({ email: 'invalid-email', password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(InvalidEmailError);
        expect(authProvider.signUp).not.toHaveBeenCalled();
    });

    it('deve falhar com senha muito curta', async () => {
        const output = await usecase.execute({ email: VALID_EMAIL, password: '123' });

        expect(output.error).toBeInstanceOf(InvalidPasswordError);
        expect(authProvider.signUp).not.toHaveBeenCalled();
    });

    it('deve falhar quando o usuário já existe', async () => {
        authProvider.signUp.mockResolvedValue(Either.fail(new UserAlreadyExistsError()));

        const output = await usecase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

        expect(output.error).toBeInstanceOf(UserAlreadyExistsError);
    });
});
