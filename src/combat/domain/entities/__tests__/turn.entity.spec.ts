import { CombatantId } from "../combatant.entity";
import { InvalidTurnError, Turn } from "../turn.entity";

describe('Turn Entity', () => {
    it('should be able to create a turn', () => {
        const [turn, error] = Turn.create({ round: 1, current_combatant: new CombatantId() }).asArray();
        expect(turn).toBeDefined();
        expect(error).toBeNull();
    });

    it('should be able to make a move', () => {
        const [turn, error] = Turn.create({ round: 1, current_combatant: new CombatantId() }).asArray();
        turn.makeMove(new CombatantId(), new CombatantId());
        expect(turn.moves.length).toBe(1);
        expect(error).toBeNull();
    });

    it('should be able to change the current combatant', () => {
        const [turn, _] = Turn.create({ round: 1, current_combatant: new CombatantId() }).asArray();
        const new_combatant = new CombatantId();
        turn.changeCurrentCombatant(new_combatant);
        expect(turn.current_combatant).toBe(new_combatant);
    });

    it('should not be able to create a turn with a round less than 1', () => {
        const [_, error] = Turn.create({ round: 0, current_combatant: new CombatantId() }).asArray();

        expect(error).toBeInstanceOf(InvalidTurnError);
    });

    it('should not be able to create a turn without a current combatant', () => {
        const [_, error] = Turn.create({ round: 1, current_combatant: undefined as unknown as CombatantId }).asArray();
        expect(error).toBeInstanceOf(InvalidTurnError);
    });

});