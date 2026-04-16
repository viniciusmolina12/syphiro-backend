import { Either } from "../../../@shared/either";
import { EntityId } from "../../../@shared/entity-id.vo";
import { CombatantId } from "./combatant.entity";
import { Move } from "./move.entity";

class TurnId extends EntityId {}

interface TurnConstructorProps {
    id?: TurnId
    moves?: Move[];
    round: number;
    active: boolean;
    current_combatant: CombatantId;
}

interface TurnCreateCommand {
    round: number;
    current_combatant: CombatantId;
}

export const TURN_RULES = {
    MIN_ROUND: {
        message: 'Round must be greater than 0',
        value: 1,
    },
    CURRENT_COMBATANT_REQUIRED: {
        message: 'Current combatant is required',
        value: true,
    },
} as const;

export class Turn {
    public readonly id: TurnId;
    public readonly moves: Move[];
    public readonly round: number;
    private _active: boolean;
    private _current_combatant: CombatantId;

    private constructor(props: TurnConstructorProps) {
        this.id = props.id ?? new TurnId();
        this.moves = props.moves ?? [];
        this.round = props.round;
        this._current_combatant = props.current_combatant;
        this._active = props.active;
    }

    static create(command: TurnCreateCommand): Either<Turn, InvalidTurnError> {
        return Either.safe(() => {
            this.validate(command);
            return new Turn({ ...command, active: true });
        });
    }

    private static validate(command: TurnCreateCommand) {
        if(TURN_RULES.CURRENT_COMBATANT_REQUIRED.value && !command.current_combatant) {
            throw new InvalidTurnError(TURN_RULES.CURRENT_COMBATANT_REQUIRED.message);
        }
        if(command.round < TURN_RULES.MIN_ROUND.value) {
            throw new InvalidTurnError(TURN_RULES.MIN_ROUND.message);
        }
    }

    public makeMove(source_combatant: CombatantId, target_combatant: CombatantId) {
        const move = Move.create({ round: this.round, combatant_source: source_combatant, combatant_target: target_combatant });
        this.moves.push(move);
    }

    public inactiveTurn(): void {
        this._active = false;
    }

    public changeCurrentCombatant(combatant_id: CombatantId) {
        this._current_combatant = combatant_id;
    }

    public get current_combatant(): CombatantId {
        return this._current_combatant;
    }
    public get active(): boolean {
        return this._active;
    }
 
}


export class InvalidTurnError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTurnError';
    }
}