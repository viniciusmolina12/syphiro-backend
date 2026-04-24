import { Either } from '@shared/either';
import { Email, InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { IAuthProvider, ConfirmSignUpProviderError } from '@auth/domain/providers/auth.provider';

export interface ConfirmSignUpInput {
    email: string;
    code: string;
}

type ConfirmSignUpUsecaseError = InvalidEmailError | ConfirmSignUpProviderError;

export class ConfirmSignUpUsecase {
    constructor(private readonly authProvider: IAuthProvider) {}

    async execute(input: ConfirmSignUpInput): Promise<Either<void, ConfirmSignUpUsecaseError>> {
        const [email, email_error] = Email.create(input.email).asArray();
        if (email_error) return Either.fail(email_error);

        return this.authProvider.confirmSignUp(email.value, input.code);
    }
}
