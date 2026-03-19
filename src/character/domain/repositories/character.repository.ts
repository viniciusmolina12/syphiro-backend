import { Character, CharacterId } from "../character.aggregate";

export interface ICharacterRepository {
    create(character: Character): Promise<void>;
    findById(id: CharacterId): Promise<Character | null>;
}