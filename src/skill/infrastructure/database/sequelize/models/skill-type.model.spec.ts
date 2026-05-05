import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';
import { SkillTypeModel, skillTypeModelSynced } from './skill-type.model';
import { SkillType } from '@skill/domain/skill.entity';

const VALID_TYPE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567891';

describe('SkillTypeModel', () => {

    afterAll(async () => {
        await SEQUELIZE_CONFIG.truncate();
    })

    beforeEach(async () => {
        await SEQUELIZE_CONFIG.truncate();
    });
    it('deve criar um registro de skill_type', async () => {
        await SkillTypeModel.create({ id: VALID_TYPE_ID, description: 'Habilidade de ataque' });

        const record = await SkillTypeModel.findByPk(VALID_TYPE_ID);
        expect(record).not.toBeNull();
        expect(record!.id).toBe(VALID_TYPE_ID);
        expect(record!.description).toBe('Habilidade de ataque');
    });

    it('deve rejeitar registros com id duplicado', async () => {
        await SkillTypeModel.create({ id: SkillType.PASSIVE, description: 'Passiva' });

        await expect(
            SkillTypeModel.create({ id: SkillType.PASSIVE, description: 'Duplicado' }),
        ).rejects.toThrow();
    });
});
