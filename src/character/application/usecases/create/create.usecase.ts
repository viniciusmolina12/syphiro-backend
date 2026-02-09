import { InstanceExistsByIdValidation } from "../../../../instance/application/validations/instance_exists_by_id.validation";
import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Character } from "../../../domain/character.aggregate";
import { ClassId } from "../../../domain/entities/class";
import { ICharacterRepository } from "../../../domain/repositories/character.repository";
import { ClassExistsByIdValidation } from "../../validations/class_exists_by_id.validation";

interface CreateCharacterInput {
    player_id: PlayerId;// Vai buscar no middleawre e devolver o player_id
    instance_id: string;
    class_id: string;
}

interface CreateCharacterOutput {
    character: Character;
}

export class CreateCharacterUsecase {
    constructor(
        private readonly characterRepository: ICharacterRepository, 
        private readonly instanceExistsByIdValidation: InstanceExistsByIdValidation,
        private readonly classExistsByIdValidation: ClassExistsByIdValidation
    ) {}

    async execute(command: CreateCharacterInput): Promise<CreateCharacterOutput> {
        const { player_id, instance_id, class_id } = command;
        
        const [_, instance_not_exists] = (await this.instanceExistsByIdValidation.validate(new InstanceId(instance_id))).asArray();
        const [class_character, class_not_exists] = (await this.classExistsByIdValidation.validate(new ClassId(class_id))).asArray();
        const [character, character_error] = Character.create({class: class_character, instance_id: new InstanceId(instance_id), player_id}).asArray();
        
        const notification = character.notification;
        if(instance_not_exists) notification.addError(instance_not_exists.message)
        if(class_not_exists) notification.addError(class_not_exists.message)
        if(character_error) notification.addError(character_error.message)

        if(notification.hasErrors()) throw new Error(notification.getErrorsMessages())
        await this.characterRepository.create(character);
        return {character};
    }
}