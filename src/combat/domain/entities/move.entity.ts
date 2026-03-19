import { EntityId } from "../../../@shared/entity-id.vo";
import { CombatantId } from "./combatant.entity";

class MoveId extends EntityId {}

interface MoveConstructorProps {
    id?: MoveId;
    round: number;
    combatant_source: CombatantId;
    combatant_target: CombatantId;
    created_at?: Date;
}

interface MoveCreateCommand {
    round: number;
    combatant_source: CombatantId;
    combatant_target: CombatantId;
}

export class Move {
    public readonly id: MoveId;
    public readonly round: number;
    public readonly combatant_source: CombatantId;
    public readonly combatant_target: CombatantId;
    public readonly created_at: Date;

    private constructor(props: MoveConstructorProps) {
        this.id = props.id ?? new MoveId();
        this.round = props.round;
        this.combatant_source = props.combatant_source;
        this.combatant_target = props.combatant_target;
        this.created_at = props.created_at ?? new Date();
    }

    static create(command: MoveCreateCommand): Move {
        return new Move({ ...command })
    }
}