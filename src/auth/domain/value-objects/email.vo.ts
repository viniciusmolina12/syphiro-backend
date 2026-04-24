import { Either } from '@shared/either';
import { ValueObject } from '@shared/value-object';

export const EMAIL_RULES = {
    INVALID: { message: 'Email must be a valid email address' },
} as const;

export class InvalidEmailError extends Error {
    constructor() {
        super(EMAIL_RULES.INVALID.message);
        this.name = 'InvalidEmailError';
    }
}

export class Email extends ValueObject {
    public readonly value: string;

    private constructor(value: string) {
        super();
        this.value = value;
    }

    static create(value: string): Either<Email, InvalidEmailError> {
        return Either.safe(() => {
            if (!value || value.trim().length === 0) throw new InvalidEmailError();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) throw new InvalidEmailError();
            return new Email(value.trim().toLowerCase());
        });
    }

    equals(vo: ValueObject): boolean {
        if (!(vo instanceof Email)) return false;
        return this.value === vo.value;
    }

    toString(): string {
        return this.value;
    }
}
