import { CharacterId } from "@character/domain/character.aggregate";
import { EnemyId } from "@enemy/domain/enemy.aggregate";
import { Combatant, CombatantId } from "@combat/domain/entities/combatant.entity";

describe('Combatant Entity', () => {
    it('should be able to create a player combatant', () => {
        const combatant = Combatant.createPlayer(new CharacterId());
        expect(combatant).toBeDefined();
    });

    it('should be able to create a enemy combatant', () => {
        const combatant = Combatant.createEnemy(new EnemyId());
        expect(combatant).toBeDefined();
    });

    it('should be able to check if a combatant is a player', () => {
        const combatant = Combatant.createPlayer(new CharacterId());
        expect(combatant.isCharacter()).toBe(true);
        expect(combatant.isEnemy()).toBe(false);
    });

    it('should be able to check if a combatant is a enemy', () => {
        const combatant = Combatant.createEnemy(new EnemyId());
        expect(combatant.isEnemy()).toBe(true);
        expect(combatant.isCharacter()).toBe(false);
    });
});