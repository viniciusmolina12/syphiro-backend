import { Either } from '@shared/either';
import { Email, InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { Password, InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import { IAuthProvider, SignUpResult, SignUpProviderError } from '@auth/domain/providers/auth.provider';
import { Name } from '@player/domain/value-objects/name.vo';

export interface SignUpInput {
    email: string;
    password: string;
    name: string;
}

type SignUpUsecaseError = InvalidEmailError | InvalidPasswordError | SignUpProviderError;

export class SignUpUsecase {
    constructor(private readonly authProvider: IAuthProvider) {}

    async execute(input: SignUpInput): Promise<Either<SignUpResult, SignUpUsecaseError>> {
        const [email, email_error] = Email.create(input.email).asArray();
        if (email_error) return Either.fail(email_error);

        const [password, password_error] = Password.create(input.password).asArray();
        if (password_error) return Either.fail(password_error);

        const [name, name_error] = Name.create(input.name).asArray();
        if (name_error) return Either.fail(name_error);

        return this.authProvider.signUp(email.value, password.value, name.value);
    }
}
