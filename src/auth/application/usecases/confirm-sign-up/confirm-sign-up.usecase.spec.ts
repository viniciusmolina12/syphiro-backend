import { ConfirmSignUpUsecase } from './confirm-sign-up.usecase';
import { IAuthProvider } from '@auth/domain/providers/auth.provider';
import { Either } from '@shared/either';
import { InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import {
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
    UserNotFoundError,
} from '@auth/domain/errors';

const VALID_EMAIL = 'user@example.com';
const VALID_CODE = '123456';

const makeAuthProvider = (): jest.Mocked<IAuthProvider> => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    confirmSignUp: jest.fn(),
    refreshToken: jest.fn(),
});

describe('ConfirmSignUpUsecase', () => {
    let usecase: ConfirmSignUpUsecase;
    let authProvider: jest.Mocked<IAuthProvider>;

    beforeEach(() => {
        authProvider = makeAuthProvider();
        usecase = new ConfirmSignUpUsecase(authProvider);
    });

    it('deve confirmar o cadastro com sucesso', async () => {
        authProvider.confirmSignUp.mockResolvedValue(Either.ok(void 0));

        const output = await usecase.execute({ email: VALID_EMAIL, code: VALID_CODE });

        expect(output.isOk()).toBe(true);
        expect(authProvider.confirmSignUp).toHaveBeenCalledWith(VALID_EMAIL, VALID_CODE);
    });

    it('deve normalizar o email antes de chamar o provider', async () => {
        authProvider.confirmSignUp.mockResolvedValue(Either.ok(void 0));

        await usecase.execute({ email: '  User@Example.COM  ', code: VALID_CODE });

        expect(authProvider.confirmSignUp).toHaveBeenCalledWith('user@example.com', VALID_CODE);
    });

    it('deve falhar com email inválido', async () => {
        const output = await usecase.execute({ email: 'invalid', code: VALID_CODE });

        expect(output.error).toBeInstanceOf(InvalidEmailError);
        expect(authProvider.confirmSignUp).not.toHaveBeenCalled();
    });

    it('deve falhar com código de confirmação inválido', async () => {
        authProvider.confirmSignUp.mockResolvedValue(Either.fail(new InvalidConfirmationCodeError()));

        const output = await usecase.execute({ email: VALID_EMAIL, code: '000000' });

        expect(output.error).toBeInstanceOf(InvalidConfirmationCodeError);
    });

    it('deve falhar com código de confirmação expirado', async () => {
        authProvider.confirmSignUp.mockResolvedValue(Either.fail(new ExpiredConfirmationCodeError()));

        const output = await usecase.execute({ email: VALID_EMAIL, code: VALID_CODE });

        expect(output.error).toBeInstanceOf(ExpiredConfirmationCodeError);
    });

    it('deve falhar quando o usuário não existe', async () => {
        authProvider.confirmSignUp.mockResolvedValue(Either.fail(new UserNotFoundError()));

        const output = await usecase.execute({ email: VALID_EMAIL, code: VALID_CODE });

        expect(output.error).toBeInstanceOf(UserNotFoundError);
    });
});
