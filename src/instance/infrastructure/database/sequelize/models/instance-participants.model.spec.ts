import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { InstanceParticipantsModel, instanceParticipantsModelSynced } from "./instance-participants.model";

const VALID_INSTANCE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_PLAYER_ID = 'b1c2d3e4-f5a6-7890-abcd-ef1234567891';

describe('InstanceParticipantsModel', () => {
    beforeAll(async () => {
        await instanceParticipantsModelSynced;
    });

    afterAll(async () => {
        // await SEQUELIZE_CONFIG.close();
    });

    it('deve criar um instance participants model com os atributos corretos', () => {
        const model = new InstanceParticipantsModel({
            instance_id: VALID_INSTANCE_ID,
            player_id: VALID_PLAYER_ID,
        });

        expect(model.instance_id).toBe(VALID_INSTANCE_ID);
        expect(model.player_id).toBe(VALID_PLAYER_ID);
    });
});
