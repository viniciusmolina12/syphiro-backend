import { Either } from "../../../@shared/either";
import { ValueObject } from "../../../@shared/value-object";

export const NAME_RULES = {
    MIN_LENGTH: {
        message: 'Name must be at least 3 characters long',
        value: 3,
    },
    MAX_LENGTH: {
        message: 'Name must be less than 255 characters long',
        value: 255,
    },
} as const;

export class Name extends ValueObject {
    public readonly value: string;

    private constructor(value: string) {
        super();
        Name.validate(value);
        this.value = value;
    }

    static create(value: string): Either<Name, InvalidNameError> {
        return Either.safe(() => new Name(value));
    }

    private static validate(value: string): void {
        if (value.length < NAME_RULES.MIN_LENGTH.value) {
            throw new InvalidNameError(NAME_RULES.MIN_LENGTH.message);
        }
        if (value.length > NAME_RULES.MAX_LENGTH.value) {
            throw new InvalidNameError(NAME_RULES.MAX_LENGTH.message);
        }
    }

    toString(): string {
        return this.value;
    }
}   

export class InvalidNameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidNameError';
    }
}

