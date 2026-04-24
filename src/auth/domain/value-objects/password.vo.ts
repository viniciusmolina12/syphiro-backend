import { Either } from '@shared/either';
import { ValueObject } from '@shared/value-object';

export const PASSWORD_RULES = {
    MIN_LENGTH: { message: 'Password must be at least 8 characters long', value: 8 },
    MAX_LENGTH: { message: 'Password must be less than 256 characters long', value: 256 },
} as const;

export class InvalidPasswordError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPasswordError';
    }
}

export class Password extends ValueObject {
    public readonly value: string;

    private constructor(value: string) {
        super();
        this.value = value;
    }

    static create(value: string): Either<Password, InvalidPasswordError> {
        return Either.safe(() => {
            if (!value || value.length < PASSWORD_RULES.MIN_LENGTH.value) {
                throw new InvalidPasswordError(PASSWORD_RULES.MIN_LENGTH.message);
            }
            if (value.length > PASSWORD_RULES.MAX_LENGTH.value) {
                throw new InvalidPasswordError(PASSWORD_RULES.MAX_LENGTH.message);
            }
            return new Password(value);
        });
    }

    equals(vo: ValueObject): boolean {
        if (!(vo instanceof Password)) return false;
        return this.value === vo.value;
    }
}
