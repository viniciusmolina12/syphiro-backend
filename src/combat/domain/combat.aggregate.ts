import { AggregateRoot } from "../../@shared/domain/aggregate-root";
import { Either } from "../../@shared/either";
import { EntityId } from "../../@shared/entity-id.vo";
import { CombatantsEmptyError, NotCombatantTurnError } from "./combat.errors";
import { Combatant, CombatantId, CombatantType } from "./entities/combatant.entity";
import { Turn } from "./entities/turn.entity";
import { InstanceId } from "../../instance/domain/instance.aggregate";
import { Move } from "./entities/move.entity";

export class CombatId extends EntityId {}

interface CombatConstructorProps {
    id?: CombatId;
    instance_id: InstanceId;
    combatants: ReadonlyArray<Combatant>;
    turns: Array<Turn>;
    status: CombatStatus;
}

interface CreateCombatCommand {
    combatants: ReadonlyArray<Combatant>; 
    instance_id: InstanceId;
}

export enum CombatStatus {
    ACTIVE = 'ACTIVE',
    OVER = 'OVER'
}

export class Combat extends AggregateRoot {
    public readonly id: CombatId;
    public readonly instance_id: InstanceId;
    public readonly combatants: ReadonlyArray<Combatant>;
    public turns: Array<Turn>;
    public status: CombatStatus;
    
    private constructor(props: CombatConstructorProps) {
        super();
        this.id = props.id ?? new CombatId();
        this.instance_id = props.instance_id;
        this.combatants = props.combatants;
        this.turns = props.turns ;
        this.status = props.status;
    }


    static create(command: CreateCombatCommand): Either<Combat, CombatantsEmptyError> {
        return Either.safe(() => {
             this.validate(command) 
             const turn = Turn.create({ round: 1, current_combatant: command.combatants[0].id }).ok;
             return new Combat({ instance_id: command.instance_id, turns: [turn], combatants: command.combatants, status: CombatStatus.ACTIVE })
        });
    }

    private static validate(command: CreateCombatCommand) {
        if(command.combatants.length == 0) {
            throw new CombatantsEmptyError()
        }

        const has_combatant_player = command.combatants.some(combatant => combatant.type == CombatantType.PLAYER)
        const has_combatant_enemy = command.combatants.some(combatant => combatant.type == CombatantType.ENEMY)
        if(!has_combatant_enemy || !has_combatant_player ) {
            throw new CombatantsEmptyError()
        }
    }

    act(source_combatant: CombatantId, target_combatant: CombatantId): Either<void, NotCombatantTurnError> {
        if(!this.canAct(source_combatant)) return Either.fail(new NotCombatantTurnError())
        this.getCurrentTurn().makeMove(source_combatant, target_combatant);
        this.selectNextCombatant();
        return Either.ok(void 0);
    }

    disableCombatant(combatant_id: CombatantId): void {
        const combatant = this.combatants.find(c => c.id.equals(combatant_id));
        if (!combatant) return;
        combatant.disable();
    }

    tryMarkCombatOver(): void {
        const player_combatants = this.getActivePlayersCombatants();
        const enemy_combatants = this.getActiveEnemiesCombatants();
        if(player_combatants?.length == 0 || enemy_combatants?.length == 0) {
            this.markAsOver();
        }
    }

    public getCurrentCombatantId(): CombatantId {
        return this.getCurrentTurn().current_combatant;
    }

    private selectNextCombatant(): void {
        const combatants_already_played: CombatantId[] = this.getCurrentTurn().moves.map(move => move.combatant_source);
        const combatants_available = this.combatants.filter(combatant => !combatants_already_played.some(id => id.equals(combatant.id)) && combatant.isActive());
        if(!combatants_available.length) {
            this.nextTurn();    
            return;        
        }
        const random_combatant_id = combatants_available[Math.floor(Math.random() * combatants_available.length)].id;
        this.getCurrentTurn().changeCurrentCombatant(random_combatant_id);
    }

    private nextTurn(): void {
        const random_combatant_id = this.combatants[Math.floor(Math.random() * this.combatants.length)].id;
        const current_turn = this.getCurrentTurn();
        current_turn.inactiveTurn();
        const new_turn = Turn.create({  
             round: current_turn.round + 1, current_combatant: random_combatant_id }).ok;
        this.turns.push(new_turn);
    }

    private markAsOver(): void {
        this.status = CombatStatus.OVER;
    }
    
    private getActivePlayersCombatants(): Combatant[] | undefined {
        return this.combatants.filter(c => c.isCharacter() && c.isActive());
    }
    private getActiveEnemiesCombatants(): Combatant[] | undefined {
        return this.combatants.filter(c => c.isEnemy() && c.isActive());
    }

    private canAct(combatant_id: CombatantId): boolean {
        return this.turns[this.turns.length - 1].current_combatant.equals(combatant_id);
    }

    private getCurrentTurn(): Turn {
        return this.turns.find(turn => turn.active) ?? this.turns[this.turns.length - 1];
    }

    public getCurrentTurnMoves(): Move[] {
        return this.getCurrentTurn().moves;
    }


}