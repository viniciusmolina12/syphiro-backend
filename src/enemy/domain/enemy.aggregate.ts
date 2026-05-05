import { AggregateRoot } from "@shared/domain/aggregate-root";
import { EntityId } from "@shared/entity-id.vo";
import { Skill, SkillId } from "@skill/domain/skill.entity";
import { EnemyDiedEvent } from "@enemy/domain/events/enemy-died.event";
import { EnemyStats } from "@enemy/domain/value-objects/enemy-stats.vo";
import { Name } from "@player/domain/value-objects/name.vo";

export class EnemyId extends EntityId {}

interface EnemyConstructorProps {
    id?: EnemyId;
    name: Name;
    stats: EnemyStats;
    skills?: Skill[];
    icon: string;
}

export class Enemy extends AggregateRoot {
    public readonly id: EnemyId;
    private _stats: EnemyStats;
    public readonly icon: string;
    public readonly name: Name
    public readonly skills: Skill[];

    constructor(props: EnemyConstructorProps) {
        super();
        this.id = props.id ?? new EnemyId();
        this.name = props.name;
        this.icon = props.icon;
        this._stats = props.stats;
        this.skills = props.skills ?? [];
    }

    applyDamage(damage: number) {
        const new_stats = this.stats.updateHealth(this.stats.health - damage);
        this._stats = new_stats;

        if (this.isDead()) {
            this.addDomainEvent(new EnemyDiedEvent(this.id));
        }
    }

    public isDead(): boolean {
        return this._stats.health <= 0;
    }

    hasSkill(skill_id: SkillId): boolean {
        return this.skills.some(s => s.id.equals(skill_id));
    }

    get stats(): EnemyStats {
        return this._stats;
    }
}
