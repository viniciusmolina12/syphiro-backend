import { EntityId } from "../../../@shared/entity-id.vo";
import { CharacterId } from "../../../character/domain/character.aggregate";
import { EnemyId } from "../../../enemy/domain/enemy.aggregate";

export enum CombatantType  {
    PLAYER,
    ENEMY
}

export class CombatantId extends EntityId {}

interface CombatantConstructorProps {
    id?: CombatantId;
    reference_id: EnemyId | CharacterId;
    type: CombatantType;
    active: boolean;
}

export class Combatant {
    public readonly id: CombatantId;
    public readonly reference_id: EnemyId | CharacterId;
    public readonly type: CombatantType;
    private active: boolean;

    private constructor(props: CombatantConstructorProps) {
        this.id = props.id ?? new CombatantId();
        this.reference_id = props.reference_id;
        this.type = props.type;
        this.active = props.active;
    }

    static createPlayer(reference_id: CharacterId): Combatant {
        return new Combatant({ reference_id, type: CombatantType.PLAYER, active: true });
    }

    static createEnemy(reference_id: EnemyId): Combatant {
        return new Combatant({ reference_id, type: CombatantType.ENEMY, active: true });
    }

    isCharacter(): this is Combatant & { reference_id: CharacterId } {
        return this.type === CombatantType.PLAYER;
    }

    isEnemy(): this is Combatant & { reference_id: EnemyId } {
        return this.type === CombatantType.ENEMY;
    }

    disable(): void {
        this.active = false;
    }

    isActive(): boolean {
        return this.active;
    }
}