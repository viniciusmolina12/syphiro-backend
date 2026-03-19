import { ValueObject } from "../../../@shared/value-object";

export class EnemyStats extends ValueObject {
    public constructor(
        public readonly health: number,
        public readonly max_health: number,
    ) {
        super();
    }

    static create(health: number, max_health: number): EnemyStats {
        health = health < 0 ? 0 : health;
        return new EnemyStats(health, max_health);
    }

    updateHealth(health: number): EnemyStats {
        health = health < 0 ? 0 : health;
        return new EnemyStats(health, this.max_health);
    }
}