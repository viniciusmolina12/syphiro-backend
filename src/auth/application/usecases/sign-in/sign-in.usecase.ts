import { Either } from '@shared/either';
import { Email, InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { Password, InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import { AuthTokens } from '@auth/domain/value-objects/auth-tokens.vo';
import { IAuthProvider, SignInProviderError } from '@auth/domain/providers/auth.provider';

export interface SignInInput {
    email: string;
    password: string;
}

type SignInUsecaseError = InvalidEmailError | InvalidPasswordError | SignInProviderError;

export class SignInUsecase {
    constructor(private readonly authProvider: IAuthProvider) {}

    async execute(input: SignInInput): Promise<Either<AuthTokens, SignInUsecaseError>> {
        const [email, email_error] = Email.create(input.email).asArray();
        if (email_error) return Either.fail(email_error);

        const [password, password_error] = Password.create(input.password).asArray();
        if (password_error) return Either.fail(password_error);

        return this.authProvider.signIn(email.value, password.value);
    }
}
