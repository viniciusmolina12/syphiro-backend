import { InstanceExistsByIdValidation } from "../../../../instance/application/validations/instance_exists_by_id.validation";
import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Character } from "../../../domain/character.aggregate";
import { ClassId } from "../../../../class/domain/class.aggregate";
import { ICharacterRepository } from "../../../domain/repositories/character.repository";
import { ProfessionProgression } from "../../../domain/value-objects/profession_progression.vo";
import { ClassExistsByIdValidation } from "../../validations/class_exists_by_id.validation";
import { ProfessionsExistsByIdsValidation } from "../../validations/professions_exists_by_ids.validation";

interface CreateCharacterInput {
    player_id: PlayerId;// Vai buscar no middleawre e devolver o player_id
    instance_id: string;
    class_id: string;
    professions: string[]
}

interface CreateCharacterOutput {
    character: Character;
}

export class CreateCharacterUsecase {
    constructor(
        private readonly characterRepository: ICharacterRepository, 
        private readonly instanceExistsByIdValidation: InstanceExistsByIdValidation,
        private readonly classExistsByIdValidation: ClassExistsByIdValidation,
        private readonly professionsExistsByIdsValidation: ProfessionsExistsByIdsValidation
    ) {}

    async execute(command: CreateCharacterInput): Promise<CreateCharacterOutput> {
        const { player_id, instance_id, class_id, professions } = command;
        
        const [_, instance_not_exists] = (await this.instanceExistsByIdValidation.validate(new InstanceId(instance_id))).asArray();
        const [class_character, class_not_exists] = (await this.classExistsByIdValidation.validate(new ClassId(class_id))).asArray();
        const [professions_character, professions_not_exists] = (await this.professionsExistsByIdsValidation.validate(professions)).asArray();
        const professions_progressions = professions_character.map(profession => ProfessionProgression.create<ProfessionProgression>(0).ok);
        const [character, character_error] = Character.create({class: class_character, instance_id: new InstanceId(instance_id), player_id, professions: professions_character}).asArray();
        
        const notification = character.notification;
        if(instance_not_exists) notification.addError(instance_not_exists.message)
        if(class_not_exists) notification.addError(class_not_exists.message)
        if(professions_not_exists) notification.addError(professions_not_exists.message)
        if(character_error) notification.addError(character_error.message)

        if(notification.hasErrors()) throw new Error(notification.getErrorsMessages())
        await this.characterRepository.create(character);
        return {character};
    }
}