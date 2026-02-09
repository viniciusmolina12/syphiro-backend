import { Character } from "../../../domain/character.aggregate";
import { ICharacterRepository } from "../../../domain/repositories/character.repository";

export class CharacterInMemoryDatabase implements ICharacterRepository {
    private characters: Character[] = [];

    async create(character: Character): Promise<void> {
        this.characters.push(character);
    }
}