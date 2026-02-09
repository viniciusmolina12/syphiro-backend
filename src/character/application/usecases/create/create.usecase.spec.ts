import { Either } from "../../../../@shared/either";
import { InstanceExistsByIdValidation } from "../../../../instance/application/validations/instance_exists_by_id.validation";
import { Instance, InstanceId } from "../../../../instance/domain/instance.aggregate";
import { IInstanceRepository } from "../../../../instance/domain/repositories/instance.repository";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Character } from "../../../domain/character.aggregate";
import { Class, ClassId } from "../../../domain/entities/class";
import { ICharacterRepository } from "../../../domain/repositories/character.repository";
import { IClassRepository } from "../../../domain/repositories/class.repository";
import { ClassExistsByIdValidation } from "../../validations/class_exists_by_id.validation";
import { CreateCharacterUsecase } from "./create.usecase";


class CharacterRepositoryStub implements ICharacterRepository {
    async create(_: Character): Promise<void> {
        return;
    }
}
class ClassRepositoryStub implements IClassRepository {
    async findById(_: ClassId): Promise<Class> {
        return new Class({id: new ClassId('1'), name: 'Mago', description: 'Mago', icon: 'mago.png', skills: []});
    }
}
class InstanceRepositoryStub implements IInstanceRepository {
    async findById(_: InstanceId): Promise<Instance> {
        return Instance.create();
    }
    async existsById(_: InstanceId): Promise<boolean> {
        return true;
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
    const createCharacterUsecase = new CreateCharacterUsecase(characterRepository, instanceExistsByIdValidation, classExistsByIdValidation);
    return { createCharacterUsecase, characterRepository, instanceRepository, classRepository, instanceExistsByIdValidation, classExistsByIdValidation };
}
describe('CreateCharacterUsecase', () => {
    it('should be able to create a character', async () => {
        const { createCharacterUsecase } = makeSut();
        const character = await createCharacterUsecase.execute({player_id: new PlayerId(), instance_id: '1' as string, class_id: '1' as string});
        expect(character).toBeDefined();
    });

    it('should not be able to create a character if the instance does not exist', async () => {
        const { createCharacterUsecase, instanceRepository } = makeSut();
        jest.spyOn(instanceRepository, 'existsById').mockReturnValue(Promise.resolve(false));
        expect(async () => {    
            await createCharacterUsecase.execute({player_id: new PlayerId(), instance_id: '1' as string, class_id: '1' as string});
        }).rejects.toThrow(new Error('Instance not found')); 
    });

    it('should not be able to create a character if the class does not exist', async () => {
        const { createCharacterUsecase, classRepository } = makeSut();
        jest.spyOn(classRepository, 'findById').mockReturnValue(Promise.resolve(null));
        expect(async () => {    
            await createCharacterUsecase.execute({player_id: new PlayerId(), instance_id: '1' as string, class_id: '1' as string});
        }).rejects.toThrow(new Error('Class not found'));
    });
});