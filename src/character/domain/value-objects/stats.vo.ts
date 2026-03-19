import { Either } from "../../../@shared/either";
import { ValueObject } from "../../../@shared/value-object";

export const STATS_RULES = {
    MIN_HEALTH: {
        message: 'Health must be greater than 0',
        value: 0,
    },
} as const;
export class Stats extends ValueObject {
    protected constructor(
        public readonly health: number,
    ) {
        super();
        this.health = health;
    }

    static create(health: number): Either<Stats, InvalidStatsError> {
        return Either.safe(() => new Stats(health));
    }

    validate(): void {
        if (this.health < STATS_RULES.MIN_HEALTH.value) {
            throw new InvalidStatsError(STATS_RULES.MIN_HEALTH.message);
        }
    }
}

export class InvalidStatsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidStatsError';
    }
}