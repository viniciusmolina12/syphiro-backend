import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Character } from "../../../domain/character.aggregate";
import { Class, ClassId } from "../../../../class/domain/class.aggregate";
import { CharacterInMemoryDatabase } from "./character-in-memory.database";

const makeCharacter = () => {
    return Character.create({instance_id: new InstanceId('1'), class: new Class({id: new ClassId('1'), name: 'Mago', description: 'Mago', icon: 'mago.png', skills: []}), player_id: new PlayerId('1'), professions: []}).ok;
}
describe('CharacterInMemoryDatabase', () => {
    it('should be able to create a character', async () => {
        const characterInMemoryDatabase = new CharacterInMemoryDatabase();
        const character = makeCharacter();
        await characterInMemoryDatabase.save(character);
        expect(await characterInMemoryDatabase.findById(character.id)).toBe(character);
    });

    it('should be able to find a character by id', async () => {
        const characterInMemoryDatabase = new CharacterInMemoryDatabase();
        const character = makeCharacter();
        await characterInMemoryDatabase.save(character);
        expect(await characterInMemoryDatabase.findById(character.id)).toBe(character);
    });

    it('should be able to check if a character exists by ids', async () => {
        const characterInMemoryDatabase = new CharacterInMemoryDatabase();
        const character = makeCharacter();
        await characterInMemoryDatabase.save(character);
        expect(await characterInMemoryDatabase.existsByIds([character.id], new InstanceId('1'))).toBe(true);
    });
});