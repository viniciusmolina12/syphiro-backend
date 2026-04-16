import { Either } from '@shared/either';
import { ValueObject } from '@shared/value-object';


export const IDENTITY_ID_RULES = {
    EMPTY: {
        message: 'Identity ID cannot be empty',
    },
} as const;

export class InvalidIdentityIdError extends Error {
    constructor() {
        super(IDENTITY_ID_RULES.EMPTY.message);
        this.name = 'InvalidIdentityIdError';
    }
}

export class IdentityId extends ValueObject {
    public readonly value: string;

    constructor(value: string) {
        super();
        this.value = value;
    }

    static create(value: string): Either<IdentityId, InvalidIdentityIdError> {
        return Either.safe(() => {
            if (!value || value.trim().length === 0) {
                throw new InvalidIdentityIdError();
            }
            return new IdentityId(value.trim());
        });
    }

    equals(vo: ValueObject): boolean {
        if (!(vo instanceof IdentityId)) return false;
        return this.value === vo.value;
    }

    toString(): string {
        return this.value;
    }
}
