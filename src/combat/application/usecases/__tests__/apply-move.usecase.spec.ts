    import { Character, CharacterId } from "../../../../character/domain/character.aggregate";
import { Class } from "../../../../class/domain/class.aggregate";
import { ClassSkill, SkillType } from "../../../../class/domain/class_skill";
import { Enemy, EnemyId } from "../../../../enemy/domain/enemy.aggregate";
import { EnemyStats } from "../../../../enemy/domain/value-objects/enemy-stats.vo";
import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Combat, CombatId } from "../../../domain/combat.aggregate";
import {
    CombatantNotFoundError,
    CombatNotFoundError,
    NotCombatantTurnError,
    SkillNotFoundError,
    SkillNotOwnedError,
} from "../../../domain/combat.errors";
import { Combatant } from "../../../domain/entities/combatant.entity";
import { CalculateCharacterDamageService } from "../../../domain/services/calculate-character-damage.service";
import { ApplyMoveUsecase } from "../apply-move.usecase";
import {
    InMemoryCharacterRepository,
    InMemoryClassSkillRepository,
    InMemoryCombatRepository,
    InMemoryEnemyRepository,
} from "./__mocks__/repositories.mock";

// ─── Factories ───────────────────────────────────────────────────────────────

const makeSkill = (base_damage = 10) =>
    ClassSkill.create({
        name: 'Fireball',
        description: 'A ball of fire',
        icon: 'fireball',
        cooldown: 0,
        base_damage,
        type: SkillType.ATTACK,
    });

const makeClass = (skills: ClassSkill[] = []) =>
    new Class({ name: 'Mage', description: 'A mage', icon: 'mage', skills });

const makeCharacter = (classEntity: Class) =>
    Character.create({
        player_id: new PlayerId(),
        instance_id: new InstanceId(),
        class: classEntity,
        professions: [],
    }).ok;

const makeEnemy = (health = 100) =>
    new Enemy({ stats: EnemyStats.create(health, health) });

// ─── SUT ─────────────────────────────────────────────────────────────────────

interface SutTypes {
    applyMoveUsecase: ApplyMoveUsecase;
    combatRepository: InMemoryCombatRepository;
    characterRepository: InMemoryCharacterRepository;
    enemyRepository: InMemoryEnemyRepository;
    classSkillRepository: InMemoryClassSkillRepository;
}

const makeSut = (): SutTypes => {
    const combatRepository = new InMemoryCombatRepository();
    const characterRepository = new InMemoryCharacterRepository();
    const enemyRepository = new InMemoryEnemyRepository();
    const classSkillRepository = new InMemoryClassSkillRepository();
    const calculateCharacterDamageService = new CalculateCharacterDamageService();
    const applyMoveUsecase = new ApplyMoveUsecase(
        combatRepository,
        characterRepository,
        enemyRepository,
        classSkillRepository,
        calculateCharacterDamageService,
    );
    return { applyMoveUsecase, combatRepository, characterRepository, enemyRepository, classSkillRepository };
};

// ─── Cenário completo ─────────────────────────────────────────────────────────

interface Scenario {
    sut: SutTypes;
    combat: Combat;
    character: Character;
    enemy: Enemy;
    skill: ClassSkill;
    playerCombatant: Combatant;
    enemyCombatant: Combatant;
}

/**
 * Monta o cenário padrão com todos os repositórios populados.
 * O jogador é sempre o primeiro da lista, portanto age no primeiro turno.
 */
const makeScenario = (options?: { enemyHealth?: number; skillDamage?: number }): Scenario => {
    const sut = makeSut();

    const skill = makeSkill(options?.skillDamage);
    const playerClass = makeClass([skill]);
    const character = makeCharacter(playerClass);
    const enemy = makeEnemy(options?.enemyHealth);

    const playerCombatant = Combatant.createPlayer(character.id);
    const enemyCombatant = Combatant.createEnemy(enemy.id);

    const combat = Combat.create({
        combatants: [playerCombatant, enemyCombatant],
        instance_id: new InstanceId(),
    });

    sut.combatRepository.save(combat);
    sut.characterRepository.create(character);
    sut.enemyRepository.save(enemy);
    sut.classSkillRepository.save(skill);

    return { sut, combat, character, enemy, skill, playerCombatant, enemyCombatant };
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('ApplyMoveUsecase', () => {
    describe('execute', () => {

        describe('sucesso', () => {

            it('deve retornar Either.ok quando o jogador ataca o inimigo com sucesso', async () => {
                const { sut, combat, skill, playerCombatant, enemyCombatant } = makeScenario();

                const [result, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeNull();
                expect(result).toBeUndefined();
            });

            it('deve aplicar o dano da skill ao inimigo', async () => {
                const SKILL_DAMAGE = 30;
                const ENEMY_HEALTH = 100;
                const { sut, combat, enemy, skill, playerCombatant, enemyCombatant } = makeScenario({
                    skillDamage: SKILL_DAMAGE,
                    enemyHealth: ENEMY_HEALTH,
                });

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(enemy.stats.health).toBe(ENEMY_HEALTH - SKILL_DAMAGE);
            });

            it('deve registrar o movimento no turno atual do combate', async () => {
                const { sut, combat, skill, playerCombatant, enemyCombatant } = makeScenario();

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(combat.turn.moves).toHaveLength(1);
                expect(combat.turn.moves[0].combatant_source.equals(playerCombatant.id)).toBe(true);
                expect(combat.turn.moves[0].combatant_target.equals(enemyCombatant.id)).toBe(true);
            });

            it('deve persistir o combate no repositório após o movimento', async () => {
                const { sut, combat, skill, playerCombatant, enemyCombatant } = makeScenario();
                const saveSpy = jest.spyOn(sut.combatRepository, 'save');

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(saveSpy).toHaveBeenCalledWith(combat);
            });
        });

        describe('erros', () => {

            it('deve retornar CombatNotFoundError quando o combate não existe', async () => {
                const sut = makeSut();

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: new CombatId(),
                    skill_id: makeSkill().id,
                    combatant_id: Combatant.createPlayer(new CharacterId()).id,
                    target_combatant_id: Combatant.createEnemy(new EnemyId()).id,
                });

                expect(error).toBeInstanceOf(CombatNotFoundError);
            });

            it('deve retornar CombatantNotFoundError quando o combatente não pertence ao combate', async () => {
                const { sut, combat, skill, enemyCombatant } = makeScenario();
                const outsider = Combatant.createPlayer(new CharacterId());

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: outsider.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar CombatantNotFoundError quando o alvo não pertence ao combate', async () => {
                const { sut, combat, skill, playerCombatant } = makeScenario();
                const outsider = Combatant.createEnemy(new EnemyId());

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: outsider.id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar SkillNotFoundError quando a skill não existe no repositório', async () => {
                const { sut, combat, playerCombatant, enemyCombatant } = makeScenario();
                const unknownSkill = makeSkill();

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: unknownSkill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(SkillNotFoundError);
            });

            it('deve retornar CombatantNotFoundError quando o personagem não existe no repositório', async () => {
                const sut = makeSut();

                const skill = makeSkill();
                const enemy = makeEnemy();
                const playerCombatant = Combatant.createPlayer(new CharacterId());
                const enemyCombatant = Combatant.createEnemy(enemy.id);

                const combat = Combat.create({
                    combatants: [playerCombatant, enemyCombatant],
                    instance_id: new InstanceId(),
                });

                // character propositalmente ausente do repositório
                sut.combatRepository.save(combat);
                sut.enemyRepository.save(enemy);
                sut.classSkillRepository.save(skill);

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar CombatantNotFoundError quando o inimigo alvo não existe no repositório', async () => {
                const sut = makeSut();

                const skill = makeSkill();
                const playerClass = makeClass([skill]);
                const character = makeCharacter(playerClass);
                const playerCombatant = Combatant.createPlayer(character.id);
                const enemyCombatant = Combatant.createEnemy(new EnemyId());

                const combat = Combat.create({
                    combatants: [playerCombatant, enemyCombatant],
                    instance_id: new InstanceId(),
                });

                // enemy propositalmente ausente do repositório
                sut.combatRepository.save(combat);
                sut.characterRepository.create(character);
                sut.classSkillRepository.save(skill);

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar SkillNotOwnedError quando o personagem não possui a skill usada', async () => {
                const { sut, combat, playerCombatant, enemyCombatant } = makeScenario();
                const foreignSkill = makeSkill();
                sut.classSkillRepository.save(foreignSkill);

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: foreignSkill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(SkillNotOwnedError);
            });

            it('deve retornar NotCombatantTurnError quando não é a vez do combatente agir', async () => {
                const { sut, combat, skill, playerCombatant, enemyCombatant } = makeScenario();

                // Jogador age na sua vez (turno avança para o inimigo)
                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                // Jogador tenta agir novamente fora de sua vez
                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatant.id,
                    target_combatant_id: enemyCombatant.id,
                });

                expect(error).toBeInstanceOf(NotCombatantTurnError);
            });
        });
    });
});
