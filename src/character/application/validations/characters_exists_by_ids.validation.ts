import { InstanceId } from "../../../instance/domain/instance.aggregate";
import { CharacterId } from "../../domain/character.aggregate";
import { ICharacterRepository } from "../../domain/repositories/character.repository";

export class CharactersExistsByIdsValidation {
    constructor(
        private readonly characterRepository: ICharacterRepository,
    ) {}

    async validate(characters_ids: CharacterId[], instance_id: InstanceId): Promise<boolean> {
        return this.characterRepository.existsByIds(characters_ids, instance_id);
    }
}