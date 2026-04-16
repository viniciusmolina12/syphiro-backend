import { CharacterId } from "../../character/domain/character.aggregate";
import { EnemyId } from "../../enemy/domain/enemy.aggregate";
import { InstanceId } from "../../instance/domain/instance.aggregate";
import { Combat, CombatStatus } from "./combat.aggregate";
import { CombatantsEmptyError, NotCombatantTurnError } from "./combat.errors";
import { Combatant } from "./entities/combatant.entity";

const makeCombatants = () => {
    const player_combatant = Combatant.createPlayer(new CharacterId());
    const enemy_combatant = Combatant.createEnemy(new EnemyId());
    return { player_combatant, enemy_combatant };
}
describe('Combat Aggregate', () => {
    it('should be able to create a combat', () => {
        const { player_combatant, enemy_combatant } = makeCombatants();
        const combat = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() });
        expect(combat).toBeDefined();
    });

    it('should be able to mark a combat as over', () => {
        const { player_combatant, enemy_combatant } = makeCombatants();
        const [combat, _] = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() }).asArray();
        player_combatant.disable();
        combat.tryMarkCombatOver();
        expect(combat.status).toBe(CombatStatus.OVER);
    });

    it('should be able to act in a combat', () => {
        const { player_combatant, enemy_combatant } = makeCombatants();
        const [combat, _] = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() }).asArray();
        combat.act(player_combatant.id, enemy_combatant.id);
        expect(combat.status).toBe(CombatStatus.ACTIVE);
        expect(combat.getCurrentTurn().current_combatant.equals(enemy_combatant.id)).toBe(true);
    });

    it('should not be able to act in a combat if the combatant is not the current combatant', () => {
        const { player_combatant, enemy_combatant } = makeCombatants();
        const [combat, _] = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() }).asArray();
        const result = combat.act(enemy_combatant.id, player_combatant.id);
        expect(result.isFail()).toBe(true);
        expect(result.error).toBeInstanceOf(NotCombatantTurnError);
    });

    it('should be able to disable a combatant', () => {
        const { player_combatant, enemy_combatant } = makeCombatants();
        const [combat, _] = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() }).asArray();
        combat.disableCombatant(player_combatant.id);
        expect(player_combatant.isActive()).toBe(false);
    });

   it('should be able to go to the next turn', () => {
    const { player_combatant, enemy_combatant } = makeCombatants();
    const [combat, _] = Combat.create({ combatants: [player_combatant, enemy_combatant], instance_id: new InstanceId() }).asArray();
    expect(combat.getCurrentTurn().round).toBe(1);
    combat.act(player_combatant.id, enemy_combatant.id);
    combat.act(enemy_combatant.id, player_combatant.id);
    expect(combat.getCurrentTurn().round).toBe(2);
    expect(combat.getCurrentTurn().moves.length).toBe(0);
   });

   it('should return an error if combatans is empty', () => {
    const [combat, error] = Combat.create({ combatants: [], instance_id: new InstanceId() }).asArray();
    expect(error).toBeInstanceOf(CombatantsEmptyError);
    expect(combat).toBeNull();
   });

   it('should return an error if combatans is not valid', () => {
    const [combat, error] = Combat.create({ combatants: [Combatant.createPlayer(new CharacterId())], instance_id: new InstanceId() }).asArray();
    expect(error).toBeInstanceOf(CombatantsEmptyError);
    expect(combat).toBeNull();
   });
});