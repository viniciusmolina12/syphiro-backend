import { Character, CharacterId } from "@character/domain/character.aggregate";
import { CharactersExistsByIdsValidation } from "@character/application/validations/characters_exists_by_ids.validation";
import { CharacterNotFoundError } from "@character/domain/errors/character-not-found.error";
import { Class } from "@class/domain/class.aggregate";
import { CampaignChapterFloor, CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";
import { Enemy, EnemyId } from "@enemy/domain/enemy.aggregate";
import { EnemyStats } from "@enemy/domain/value-objects/enemy-stats.vo";
import { Instance, InstanceDifficulty, InstanceId } from "@instance/domain/instance.aggregate";
import { InstanceNotFoundError } from "@instance/domain/errors";
import { PlayerId } from "@player/domain/player.aggregate";
import { Name } from "@player/domain/value-objects/name.vo";
import { Combat, CombatStatus } from "@combat/domain/combat.aggregate";
import { CombatantType } from "@combat/domain/entities/combatant.entity";
import { CreateCombatUsecase } from "@combat/application/usecases/create.usecase";
import {
    InMemoryCharacterRepository,
    InMemoryCombatRepository,
    InMemoryInstanceRepository,
    InMemoryCampaignChapterFloorRepository,
} from "@combat/application/usecases/__tests__/__mocks__/repositories.mock";

// ─── Factories ────────────────────────────────────────────────────────────────

const makeClass = () => new Class({ name: 'Warrior', description: 'A warrior', icon: 'warrior', skills: [] });

const makeEnemy = (id?: EnemyId): Enemy =>
    new Enemy({
        id,
        stats: EnemyStats.create(100, 100),
        skills: [],
        icon: 'enemy.svg',
        name: Name.create('Goblin').ok,
    });

const makeInstance = (floor_id: CampaignChapterFloorId): Instance =>
    Instance.create({
        player_id: new PlayerId(),
        difficulty: InstanceDifficulty.NORMAL,
        campaign_chapter_floor_id: floor_id,
    });

const makeFloor = (enemy_id: EnemyId, id: CampaignChapterFloorId): CampaignChapterFloor =>
    CampaignChapterFloor.rehydrate({ id, floor_number: 1, enemy_id });

const makeCharacter = (instance_id: InstanceId): Character =>
    Character.create({
        player_id: new PlayerId(),
        instance_id,
        class: makeClass(),
        professions: [],
    }).ok;

// ─── SUT ─────────────────────────────────────────────────────────────────────

interface SutTypes {
    usecase: CreateCombatUsecase;
    combatRepository: InMemoryCombatRepository;
    instanceRepository: InMemoryInstanceRepository;
    floorRepository: InMemoryCampaignChapterFloorRepository;
    characterRepository: InMemoryCharacterRepository;
}

const makeSut = (): SutTypes => {
    const combatRepository = new InMemoryCombatRepository();
    const instanceRepository = new InMemoryInstanceRepository();
    const floorRepository = new InMemoryCampaignChapterFloorRepository();
    const characterRepository = new InMemoryCharacterRepository();
    const charactersExistsByIdsValidation = new CharactersExistsByIdsValidation(characterRepository);
    const usecase = new CreateCombatUsecase(
        combatRepository,
        instanceRepository,
        floorRepository,
        charactersExistsByIdsValidation,
    );
    return { usecase, combatRepository, instanceRepository, floorRepository, characterRepository };
};

// ─── Cenário ─────────────────────────────────────────────────────────────────

interface Scenario {
    sut: SutTypes;
    instance: Instance;
    floor: CampaignChapterFloor;
    characters: Character[];
    enemy: Enemy;
}

const makeScenario = (options: { characters_count?: number } = {}): Scenario => {
    const sut = makeSut();

    const floor_id = new CampaignChapterFloorId();
    const enemy = makeEnemy();
    const floor = makeFloor(enemy.id, floor_id);
    const instance = makeInstance(floor_id);
    const characters = Array.from(
        { length: options.characters_count ?? 1 },
        () => makeCharacter(instance.id),
    );

    sut.instanceRepository.save(instance);
    sut.floorRepository.save(floor);
    characters.forEach(c => sut.characterRepository.save(c));

    return { sut, instance, floor, characters, enemy };
};

const makeInput = (instance: Instance, characters: Character[]) => ({
    instance_id: instance.id.toString(),
    combatants_characters_ids: characters.map(c => c.id.toString()),
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('CreateCombatUsecase', () => {
    describe('sucesso', () => {
        it('deve retornar o combate criado', async () => {
            const { sut, instance, characters } = makeScenario();

            const [combat, error] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            expect(error).toBeNull();
            expect(combat).toBeInstanceOf(Combat);
        });

        it('deve criar o combate com o instance_id correto', async () => {
            const { sut, instance, characters } = makeScenario();

            const [combat] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            expect(combat.instance_id.equals(instance.id)).toBe(true);
        });

        it('deve criar um combatente PLAYER para cada character informado', async () => {
            const { sut, instance, characters } = makeScenario({ characters_count: 2 });

            const [combat] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            const player_combatants = combat.combatants.filter(c => c.type === CombatantType.PLAYER);
            expect(player_combatants).toHaveLength(2);
            expect(player_combatants.map(c => c.reference_id.toString())).toEqual(
                expect.arrayContaining(characters.map(c => c.id.toString())),
            );
        });

        it('deve criar o combatente ENEMY a partir do floor da instância', async () => {
            const { sut, instance, characters, floor } = makeScenario();

            const [combat] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            const enemy_combatants = combat.combatants.filter(c => c.type === CombatantType.ENEMY);
            expect(enemy_combatants).toHaveLength(1);
            expect(enemy_combatants[0].reference_id.equals(floor.enemy_id)).toBe(true);
        });

        it('deve iniciar o combate com status ACTIVE', async () => {
            const { sut, instance, characters } = makeScenario();

            const [combat] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            expect(combat.status).toBe(CombatStatus.ACTIVE);
        });

        it('deve persistir o combate no repositório', async () => {
            const { sut, instance, characters } = makeScenario();
            const saveSpy = jest.spyOn(sut.combatRepository, 'save');

            const [combat] = (await sut.usecase.execute(makeInput(instance, characters))).asArray();

            expect(saveSpy).toHaveBeenCalledWith(combat);
        });
    });

    describe('erros', () => {
        it('deve retornar InstanceNotFoundError quando a instância não existe', async () => {
            const { sut, characters } = makeScenario();
            const instance_inexistente = makeInstance(new CampaignChapterFloorId());

            const [, error] = (
                await sut.usecase.execute(makeInput(instance_inexistente, characters))
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotFoundError);
        });

        it('deve retornar CharacterNotFoundError quando os personagens não pertencem à instância', async () => {
            const { sut, instance } = makeScenario();
            const character_estranho = makeCharacter(new InstanceId());

            const [, error] = (
                await sut.usecase.execute({
                    instance_id: instance.id.toString(),
                    combatants_characters_ids: [character_estranho.id.toString()],
                })
            ).asArray();

            expect(error).toBeInstanceOf(CharacterNotFoundError);
        });

        it('deve retornar CharacterNotFoundError quando a lista de characters está vazia', async () => {
            const { sut, instance } = makeScenario();

            const [, error] = (
                await sut.usecase.execute({
                    instance_id: instance.id.toString(),
                    combatants_characters_ids: [],
                })
            ).asArray();

            expect(error).toBeInstanceOf(CharacterNotFoundError);
        });
    });
});
