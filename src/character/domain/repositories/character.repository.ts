import { InstanceId } from "@instance/domain/instance.aggregate";
import { Character, CharacterId } from "@character/domain/character.aggregate";

export interface ICharacterRepository {
    findById(id: CharacterId): Promise<Character | null>;
    existsByIds(ids: CharacterId[], instance_id: InstanceId): Promise<boolean>;
    save(character: Character): Promise<void>;
    update(character: Character): Promise<void>;
}