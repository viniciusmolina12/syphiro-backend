import { Character } from "../character.aggregate";

export interface ICharacterRepository {
    create(character: Character): Promise<void>;
}