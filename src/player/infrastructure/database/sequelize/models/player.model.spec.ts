import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { PlayerModel, playerModelSynced } from "./player.model";

describe('PlayerModel', () => {

    afterAll(async () => {
        await SEQUELIZE_CONFIG.truncate();
    });

    it('should create a player model', () => {
        const player = new PlayerModel({
            id: '1',
            name: 'John Doe',
            identity_id: '123',
        });
        expect(player.id).toBe('1');
        expect(player.name).toBe('John Doe');
        expect(player.identity_id).toBe('123');
        expect(player.created_at).toBeInstanceOf(Date);
        expect(player.updated_at).toBeInstanceOf(Date);
    });
});