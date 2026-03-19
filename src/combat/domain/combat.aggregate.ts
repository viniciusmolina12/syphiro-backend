import { AggregateRoot } from "../../@shared/domain/aggregate-root";
import { Either } from "../../@shared/either";
import { EntityId } from "../../@shared/entity-id.vo";
import { NotCombatantTurnError } from "./combat.errors";
import { Combatant, CombatantId, CombatantType } from "./entities/combatant.entity";
import { Turn } from "./entities/turn.entity";
import { InstanceId } from "../../instance/domain/instance.aggregate";

export class CombatId extends EntityId {}

interface CombatConstructorProps {
    id?: CombatId;
    instance_id: InstanceId;
    combatants: ReadonlyArray<Combatant>;
    turn: Turn;
}

interface CreateCombatCommand {
    combatants: ReadonlyArray<Combatant>; 
    instance_id: InstanceId;
}

export class Combat extends AggregateRoot {
    public readonly id: CombatId;
    public readonly instance_id: InstanceId;
    public readonly combatants: ReadonlyArray<Combatant>;
    public turn: Turn;

    
    private constructor(props: CombatConstructorProps) {
        super();
        this.id = props.id ?? new CombatId();
        this.instance_id = props.instance_id;
        this.combatants = props.combatants;
        this.turn = props.turn;
    }


    static create(command: CreateCombatCommand): Combat {
        this.validate(command);
        const turn = Turn.create({ round: 1, current_combatant: command.combatants[0].id }).ok;
        return new Combat({ instance_id: command.instance_id, turn: turn, combatants: command.combatants })
    }

    private static validate(command: CreateCombatCommand) {
        if(command.combatants.length == 0) {
            throw new Error('Numero de combatentes insuficiente.')
        }

        const has_combatant_player = command.combatants.some(combatant => combatant.type == CombatantType.PLAYER)
        const has_combatant_enemy = command.combatants.some(combatant => combatant.type == CombatantType.ENEMY)
        if(!has_combatant_enemy || !has_combatant_player ) {
            throw new Error('Numero de combatentes insuficiente.')
        }
    }

    act(source_combatant: CombatantId, target_combatant: CombatantId): Either<void, NotCombatantTurnError> {
        if(!this.canAct(source_combatant)) return Either.fail(new NotCombatantTurnError())
        this.turn.makeMove(source_combatant, target_combatant);
        this.selectNextCombatant();
        return Either.ok(void 0);
    }

    private selectNextCombatant(): void {
        const combatants_already_played: CombatantId[] = this.turn.moves.map(move => move.combatant_source);
        const combatants_available = this.combatants.filter(combatant => !combatants_already_played.some(id => id.equals(combatant.id)));
        if(!combatants_available.length) {
            this.nextTurn();    
            return;        
        }
        const random_combatant_id = combatants_available[Math.floor(Math.random() * combatants_available.length)].id;
        this.turn.changeCurrentCombatant(random_combatant_id);
    }

    private nextTurn(): void {
        const random_combatant_id = this.combatants[Math.floor(Math.random() * this.combatants.length)].id;
        this.turn = Turn.create({
             round: this.turn.round + 1, current_combatant: random_combatant_id }).ok;
    }


    private canAct(combatant_id: CombatantId): boolean {
        return this.turn.current_combatant.equals(combatant_id);
    }


}