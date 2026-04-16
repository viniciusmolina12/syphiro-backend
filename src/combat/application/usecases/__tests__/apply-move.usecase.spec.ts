    import { Character, CHARACTER_RULES, CharacterId } from "../../../../character/domain/character.aggregate";
import { Class } from "../../../../class/domain/class.aggregate";
import { ClassSkill, SkillType } from "../../../../class/domain/class_skill";
import { Enemy, EnemyId } from "../../../../enemy/domain/enemy.aggregate";
import { EnemyStats } from "../../../../enemy/domain/value-objects/enemy-stats.vo";
import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Skill } from "../../../../skill/domain/skill.entity";
import { Combat, CombatId, CombatStatus } from "../../../domain/combat.aggregate";
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

const makeEnemy = (health = 100, skills: Skill[] = []) =>
    new Enemy({ stats: EnemyStats.create(health, health), skills: skills });

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
    characters: Character[];
    enemies: Enemy[];
    skill: ClassSkill;
    playerCombatants: Combatant[];
    enemyCombatants: Combatant[];
}

/**
 * Monta o cenário padrão com todos os repositórios populados.
 * O jogador é sempre o primeiro da lista, portanto age no primeiro turno.
 */
const makeScenario = (options?: { 
    enemyHealth?: number; skillDamage?: number, enemy_first_combatant?: boolean, players_count?: number, enemies_count?: number }): Scenario => {
    const sut = makeSut();

    const skill = makeSkill(options?.skillDamage);
    const playerClass = makeClass([skill]);
    const characters = Array.from({ length: options?.players_count || 1 }, () => makeCharacter(playerClass));
    const playerCombatants = characters.map(character => Combatant.createPlayer(character.id));
    const enemies = Array.from({ length: options?.enemies_count || 1 }, () => makeEnemy(options?.enemyHealth, [skill]));
    const enemyCombatants = enemies.map(enemy => Combatant.createEnemy(enemy.id));

    const combat = Combat.create({
        combatants: options?.enemy_first_combatant ? [...enemyCombatants, ...playerCombatants] : [...playerCombatants, ...enemyCombatants],
        instance_id: new InstanceId(),
    }).ok;

    sut.combatRepository.save(combat);
    characters.forEach(character => sut.characterRepository.create(character));
    enemies.forEach(enemy => sut.enemyRepository.save(enemy));
    sut.classSkillRepository.save(skill);

    return { sut, combat, characters, enemies, skill, playerCombatants, enemyCombatants };
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('ApplyMoveUsecase', () => {
    describe('execute', () => {

        describe('sucesso', () => {

            describe('PLAYER ATTACK', () => {
            it('deve retornar Either.ok quando o jogador ataca o inimigo com sucesso', async () => {
                const { sut, combat, skill, playerCombatants, enemyCombatants } = makeScenario();

                const [result, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(error).toBeNull();
            });

            it('deve aplicar o dano da skill ao inimigo', async () => {
                const SKILL_DAMAGE = 30;
                const ENEMY_HEALTH = 100;
                const { sut, combat, enemies, skill, playerCombatants, enemyCombatants } = makeScenario({
                    skillDamage: SKILL_DAMAGE,
                    enemyHealth: ENEMY_HEALTH,
                });

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(enemies[0].stats.health).toBe(ENEMY_HEALTH - SKILL_DAMAGE);
            });

            it('deve registrar o movimento no turno atual do combate', async () => {
                const { sut, combat, skill, playerCombatants, enemyCombatants } = makeScenario();

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(combat.getCurrentTurnMoves()).toHaveLength(1);
                expect(combat.getCurrentTurnMoves()[0].combatant_source.equals(playerCombatants[0].id)).toBe(true);
                expect(combat.getCurrentTurnMoves()[0].combatant_target.equals(enemyCombatants[0].id)).toBe(true);
            });

            it('deve persistir o combate no repositório após o movimento', async () => {
                const { sut, combat, skill, playerCombatants, enemyCombatants } = makeScenario();
                const saveSpy = jest.spyOn(sut.combatRepository, 'update');

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(saveSpy).toHaveBeenCalledWith(combat);
            });
         });

         describe('ENEMY ATTACK', () => {
            it('deve retornar Either.ok', async () => {
                const { sut, combat, skill, playerCombatants, enemyCombatants } = makeScenario({ enemy_first_combatant: true });
                
                const [result, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: enemyCombatants[0].id,
                    target_combatant_id: playerCombatants[0].id,
                });

                expect(error).toBeNull();
            });

            it('deve aplicar o dano da skill ao jogador', async () => {
                const SKILL_DAMAGE = 30;
                const { sut, combat, characters, skill, playerCombatants, enemyCombatants } = makeScenario({
                    skillDamage: SKILL_DAMAGE,
                    enemy_first_combatant: true,
                });
                expect(combat.getCurrentCombatantId().equals(enemyCombatants[0].id)).toBe(true);

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: enemyCombatants[0].id,
                    target_combatant_id: playerCombatants[0].id,
                });
                
                const expectedHealth = CHARACTER_RULES.DEFAULT_HEALTH.value - SKILL_DAMAGE;
                expect(characters[0].getHealth()).toBe(expectedHealth);
                expect(characters[0].isDead()).toBe(expectedHealth <= 0);
                expect(combat.getCurrentCombatantId().equals(playerCombatants[0].id)).toBe(true);
            });

            it('deve desativar o combatente inimigo quando ele morre', async () => {
                const SKILL_DAMAGE = CHARACTER_RULES.DEFAULT_HEALTH.value + 1;
                const { sut, combat, characters, skill, playerCombatants, enemyCombatants } = makeScenario({
                    skillDamage: SKILL_DAMAGE,
                    enemy_first_combatant: true,
                });

                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: enemyCombatants[0].id,
                    target_combatant_id: playerCombatants[0].id,
                });
                expect(characters[0]?.isDead()).toBe(true);
                expect(combat.combatants.find(c => c.id.equals(playerCombatants[0].id))?.isActive()).toBe(false);
                expect(combat.status).toBe(CombatStatus.OVER);
            });


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
                const { sut, combat, skill, enemyCombatants } = makeScenario();
                const outsider = Combatant.createPlayer(new CharacterId());

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: outsider.id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar CombatantNotFoundError quando o alvo não pertence ao combate', async () => {
                const { sut, combat, skill, playerCombatants } = makeScenario();
                const outsider = Combatant.createEnemy(new EnemyId());

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: outsider.id,
                });

                expect(error).toBeInstanceOf(CombatantNotFoundError);
            });

            it('deve retornar SkillNotFoundError quando a skill não existe no repositório', async () => {
                const { sut, combat, playerCombatants, enemyCombatants } = makeScenario();
                const unknownSkill = makeSkill();

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: unknownSkill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
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
                }).ok;

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
                }).ok;

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
                const { sut, combat, playerCombatants, enemyCombatants } = makeScenario();
                const foreignSkill = makeSkill();
                sut.classSkillRepository.save(foreignSkill);

                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: foreignSkill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(error).toBeInstanceOf(SkillNotOwnedError);
            });

            it('deve retornar NotCombatantTurnError quando não é a vez do combatente agir', async () => {
                const { sut, combat, skill, playerCombatants, enemyCombatants } = makeScenario();

                // Jogador age na sua vez (turno avança para o inimigo)
                await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                // Jogador tenta agir novamente fora de sua vez
                const [, error] = await sut.applyMoveUsecase.execute({
                    combat_id: combat.id,
                    skill_id: skill.id,
                    combatant_id: playerCombatants[0].id,
                    target_combatant_id: enemyCombatants[0].id,
                });

                expect(error).toBeInstanceOf(NotCombatantTurnError);
            });
        });
    });


    describe('TESTE DE MESA', () => {

        it('2 jogadores e 1 inimigo', async () => {
            const { sut, combat, characters, enemies, skill, playerCombatants, enemyCombatants } = makeScenario({
                skillDamage: 10,
                enemyHealth: 100,
                players_count: 2,
                enemies_count: 1,
            });
           //FIRST CHARACTER ATTACKS FIRST ENEMY
            await sut.applyMoveUsecase.execute({
                combat_id: combat.id,
                skill_id: skill.id,
                combatant_id: playerCombatants[0].id,
                target_combatant_id: enemyCombatants[0].id,
            });
            expect(combat.getCurrentTurnMoves()).toHaveLength(1);
            expect(combat.getCurrentTurnMoves()[0].combatant_source.equals(playerCombatants[0].id)).toBe(true);
            expect(combat.getCurrentTurnMoves()[0].combatant_target.equals(enemyCombatants[0].id)).toBe(true);
            expect(enemies[0].stats.health).toBe(100 - 10);
            
            //SECOND CHARACTER ATTACKS ENEMY
            combat['turns'][0]['_current_combatant'] = playerCombatants[1].id;
            sut.combatRepository.update(combat);

              await sut.applyMoveUsecase.execute({
                combat_id: combat.id,
                skill_id: skill.id,
                combatant_id: playerCombatants[1].id,
                target_combatant_id: enemyCombatants[0].id,
            });
            expect(combat.getCurrentTurnMoves()).toHaveLength(2);
            expect(combat.getCurrentTurnMoves()[1].combatant_source.equals(playerCombatants[1].id)).toBe(true);
            expect(combat.getCurrentTurnMoves()[1].combatant_target.equals(enemyCombatants[0].id)).toBe(true);
            expect(enemies[0].stats.health).toBe(100 - 10 - 10);

            // ENEMY ATTACKS FIRST CHARACTER
            const new_skill = makeSkill(100);
            sut.classSkillRepository.save(new_skill);
            characters[0].class.skills.push(new_skill);
            combat['turns'][0]['_current_combatant'] = enemyCombatants[0].id;
            sut.combatRepository.update(combat);
            enemies[0].skills.push(new_skill);
            sut.enemyRepository.update(enemies[0]);
            const [result, error] = await sut.applyMoveUsecase.execute({
                combat_id: combat.id,
                skill_id: new_skill.id,
                combatant_id: enemyCombatants[0].id,
                target_combatant_id: playerCombatants[0].id,
            });

            expect(combat.getCurrentTurnMoves()).toHaveLength(0);
            expect(characters[0].getHealth()).toBe(CHARACTER_RULES.DEFAULT_HEALTH.value - 100);
            expect(characters[0].isDead()).toBe(true);
            expect(combat.status).toBe(CombatStatus.ACTIVE);

        });
    })
});
