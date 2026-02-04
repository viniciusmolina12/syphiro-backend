import { Either } from "../../../@shared/either";
import { ValueObject } from "../../../@shared/value-object";

export const EMAIL_RULES = {
    INVALID: {
        message: 'Invalid email',
    },
    TOO_SHORT: {
        message: 'Email must be at least 8 characters long',
        value: 8,
    },
    TOO_LONG: {
        message: 'Email must be less than 255 characters long',
        value: 255,
    },
} as const;

export class Email extends ValueObject {
    public readonly value: string;
    private constructor(value: string) {
        super();
        this.validate(value);
        this.value = value;
    }

    static create(value: string): Either<Email, InvalidEmailError> {
        return Either.safe(() => new Email(value));
    }

    private validate(value: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new InvalidEmailError(EMAIL_RULES.INVALID.message);
        }
        if (value.length < EMAIL_RULES.TOO_SHORT.value) {
            throw new InvalidEmailError(EMAIL_RULES.TOO_SHORT.message);
        }
        if (value.length > EMAIL_RULES.TOO_LONG.value) {
            throw new InvalidEmailError(EMAIL_RULES.TOO_LONG.message);
        }
    }
}

export class InvalidEmailError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidEmailError';
    }
}