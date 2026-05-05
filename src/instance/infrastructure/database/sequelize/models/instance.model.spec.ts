import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { InstanceModel, instanceModelSynced } from "./instance.model";
import { InstanceStatus, InstanceDifficulty } from "@instance/domain/instance.aggregate";

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_PLAYER_ID = 'b1c2d3e4-f5a6-7890-abcd-ef1234567891';
const VALID_FLOOR_ID = 'c1d2e3f4-a5b6-7890-abcd-ef1234567892';

describe('InstanceModel', () => {
    it('deve criar um instance model com os atributos corretos', () => {
        const model = new InstanceModel({
            id: VALID_ID,
            player_id: VALID_PLAYER_ID,
            status: InstanceStatus.PENDING,
            difficulty: InstanceDifficulty.NORMAL,
            campaign_chapter_floor_id: VALID_FLOOR_ID,
            started_at: new Date('2024-01-01T00:00:00Z'),
        });

        expect(model.id).toBe(VALID_ID);
        expect(model.player_id).toBe(VALID_PLAYER_ID);
        expect(model.status).toBe(InstanceStatus.PENDING);
        expect(model.difficulty).toBe(InstanceDifficulty.NORMAL);
        expect(model.campaign_chapter_floor_id).toBe(VALID_FLOOR_ID);
        expect(model.started_at).toBeInstanceOf(Date);
        expect(model.created_at).toBeInstanceOf(Date);
        expect(model.updated_at).toBeInstanceOf(Date);
    });
});
