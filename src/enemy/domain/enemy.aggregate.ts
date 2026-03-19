import { AggregateRoot } from "../../@shared/domain/aggregate-root";
import { EntityId } from "../../@shared/entity-id.vo";
import { EnemyStats } from "./value-objects/enemy-stats.vo";

export class EnemyId extends EntityId {}

interface EnemyConstructorProps {
    id?: EnemyId;
    stats: EnemyStats;
}

export class Enemy extends AggregateRoot {
    public readonly id: EnemyId; 
    private _stats: EnemyStats;
    
    constructor(props: EnemyConstructorProps) {
        super();
        this.id = props.id ?? new EnemyId();
        this._stats = props.stats;
    }

    applyDamage(damage: number) {
        const new_stats = this.stats.updateHealth(this.stats.health - damage);
        this._stats = new_stats;
    }

    get stats(): EnemyStats {
        return this._stats;
    }

}