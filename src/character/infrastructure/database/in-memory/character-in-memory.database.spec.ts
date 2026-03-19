import { InstanceId } from "../../../../instance/domain/instance.aggregate";
import { PlayerId } from "../../../../player/domain/player.aggregate";
import { Character } from "../../../domain/character.aggregate";
import { Class, ClassId } from "../../../../class/domain/class.aggregate";
import { CharacterInMemoryDatabase } from "./character-in-memory.database";

describe('CharacterInMemoryDatabase', () => {
    it('should be able to create a character', async () => {
        const characterInMemoryDatabase = new CharacterInMemoryDatabase();
        const character = Character.create({instance_id: new InstanceId('1'), class: new Class({id: new ClassId('1'), name: 'Mago', description: 'Mago', icon: 'mago.png', skills: []}), player_id: new PlayerId('1')}).ok;
        await characterInMemoryDatabase.create(character);
        expect(characterInMemoryDatabase['characters'].length).toBe(1);
    });
});