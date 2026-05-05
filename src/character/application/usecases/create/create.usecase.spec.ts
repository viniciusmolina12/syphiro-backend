import { Either } from "@shared/either";
import { InstanceExistsByIdValidation } from "@instance/application/validations/instance_exists_by_id.validation";
import { Instance, InstanceDifficulty, InstanceId } from "@instance/domain/instance.aggregate";
import { IInstanceRepository } from "@instance/domain/repositories/instance.repository";
import { PlayerId } from "@player/domain/player.aggregate";
import { Character, CharacterId } from "@character/domain/character.aggregate";
import { Class, ClassId } from "@class/domain/class.aggregate";
import { ICharacterRepository } from "@character/domain/repositories/character.repository";
import { IClassRepository } from "@character/domain/repositories/class.repository";
import { ClassExistsByIdValidation } from "@character/application/validations/class_exists_by_id.validation";
import { CreateCharacterUsecase } from "@character/application/usecases/create/create.usecase";
import { ProfessionsExistsByIdsValidation } from "@character/application/validations/professions_exists_by_ids.validation";
import { Profession, ProfessionId } from "@profession/domain/profession.aggregate";
import { IProfessionRepository } from "@character/domain/repositories/profession.repository";
import { CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";


class CharacterRepositoryStub implements ICharacterRepository {
    async update(_: Character): Promise<void> {
        return;
    }
    async create(_: Character): Promise<void> {
        return;
    }
    async findById(_: CharacterId): Promise<Character> {
        return Character.create({instance_id: new InstanceId('1'), class: new Class({id: new ClassId('1'), name: 'Mago', description: 'Mago', icon: 'mago.png', skills: []}), player_id: new PlayerId('1'), professions: []}).ok;
    }
    async existsByIds(_: CharacterId[]): Promise<boolean> {
        return true;
    }
    async save(_: Character): Promise<void> {
        return;
    }
}
class ClassRepositoryStub implements IClassRepository {
    async findById(_: ClassId): Promise<Class> {
        return new Class({id: new ClassId('1'), name: 'Mago', description: 'Mago', icon: 'mago.png', skills: []});
    }
}
class InstanceRepositoryStub implements IInstanceRepository {
    async findById(_: InstanceId): Promise<Instance | null> {
        return Instance.create({player_id: new PlayerId(), campaign_chapter_floor_id: new CampaignChapterFloorId(), difficulty: InstanceDifficulty.EASY});
    }
    async existsById(_: InstanceId): Promise<boolean> {
        return true;
    }
    async findActiveByPlayerId(_: PlayerId): Promise<Instance | null> {
        return null;
    }
    async save(_: Instance): Promise<void> {}
    async update(_: Instance): Promise<void> {}
}
class ProfessionRepositoryStub implements IProfessionRepository {
    async findByIds(_: ProfessionId[]): Promise<Profession[]> {
        return [Profession.create({id: new ProfessionId('1'), name: 'Mago'}).ok, Profession.create({id: new ProfessionId('2'), name: 'Arqueiro'}).ok];
    }
}
interface SutType {
    createCharacterUsecase: CreateCharacterUsecase;
    characterRepository: ICharacterRepository;
    instanceRepository: IInstanceRepository;
    classRepository: IClassRepository;
    instanceExistsByIdValidation: InstanceExistsByIdValidation;
    classExistsByIdValidation: ClassExistsByIdValidation;
}

const makeSut = (): SutType => {
    const characterRepository = new CharacterRepositoryStub();
    const instanceRepository = new InstanceRepositoryStub();
    const instanceExistsByIdValidation = new InstanceExistsByIdValidation(instanceRepository);
    const classRepository = new ClassRepositoryStub();
    const classExistsByIdValidation = new ClassExistsByIdValidation(classRepository);
    const professionRepository = new ProfessionRepositoryStub();
    const professionsExistsByIdsValidation = new ProfessionsExistsByIdsValidation(professionRepository);
    const createCharacterUsecase = new CreateCharacterUsecase(characterRepository, instanceExistsByIdValidation, classExistsByIdValidation, professionsExistsByIdsValidation);
    return { createCharacterUsecase, characterRepository, instanceRepository, classRepository, instanceExistsByIdValidation, classExistsByIdValidation };
}

const makeInput = () => {
    return {
        player_id: new PlayerId(),
        instance_id: '1' as string,
        class_id: '1' as string,
        professions: ['1' as string, '2' as string]
    }
}
describe('CreateCharacterUsecase', () => {
    it('should be able to create a character', async () => {
        const { createCharacterUsecase } = makeSut();
        const character = await createCharacterUsecase.execute(makeInput());
        expect(character).toBeDefined();
    });

    it('should not be able to create a character if the instance does not exist', async () => {
        const { createCharacterUsecase, instanceRepository } = makeSut();
        jest.spyOn(instanceRepository, 'existsById').mockReturnValue(Promise.resolve(false));
        expect(async () => {    
            await createCharacterUsecase.execute(makeInput());
        }).rejects.toThrow(new Error('Instância não encontrada'));
    });

    it('should not be able to create a character if the class does not exist', async () => {
        const { createCharacterUsecase, classRepository } = makeSut();
        jest.spyOn(classRepository, 'findById').mockReturnValue(Promise.resolve(null));
        expect(async () => {    
            await createCharacterUsecase.execute(makeInput());
        }).rejects.toThrow(new Error('Class not found'));
    });
});