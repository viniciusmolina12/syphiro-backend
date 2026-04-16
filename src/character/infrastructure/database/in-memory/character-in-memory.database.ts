import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { Character, CharacterId } from "../../../domain/character.aggregate";
import { ICharacterRepository } from "../../../domain/repositories/character.repository";

export class CharacterInMemoryDatabase implements ICharacterRepository {
    private characters: Character[] = [];

    async findById(id: CharacterId): Promise<Character | null> {
        return this.characters.find(c => c.id.equals(id)) ?? null;
    }

    async update(character: Character): Promise<void> {
        const index = this.characters.findIndex(c => c.id.equals(character.id));
        if (index !== -1) {
            this.characters[index] = character;
        }
    }

    async existsByIds(ids: CharacterId[], instance_id: InstanceId): Promise<boolean> {
        return this.characters.some(c => ids.some(id => c.id.equals(id)) && c.instance_id.equals(instance_id));
    }

    async save(character: Character): Promise<void> {
        this.characters.push(character);
    }
}