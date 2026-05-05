import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';
import { SkillTypeModel, skillTypeModelSynced } from './skill-type.model';
import { SkillModel, skillModelSynced } from './skill.model';
import { SkillType } from '@skill/domain/skill.entity';

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_TYPE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567891';

describe('SkillModel', () => {

    afterAll(async () => {
        await SEQUELIZE_CONFIG.truncate();
    })

    beforeEach(async () => {
        await SEQUELIZE_CONFIG.truncate();
    });

    it('deve criar um registro de skill', async () => {
        await SkillTypeModel.create({ id: VALID_TYPE_ID, description: 'Ataque' });
        await SkillModel.create({
            id: VALID_ID,
            name: 'Fireball',
            description: 'Lança uma bola de fogo',
            icon: 'fireball.png',
            cooldown: 3,
            base_damage: 50,
            type_id: VALID_TYPE_ID,
        });

        const record = await SkillModel.findByPk(VALID_ID);
        expect(record).not.toBeNull();
        expect(record!.name).toBe('Fireball');
        expect(record!.type_id).toBe(VALID_TYPE_ID);
    });

    it('deve rejeitar skill com type_id inexistente', async () => {
        await expect(
            SkillModel.create({
                id: 'outro-id',
                name: 'Ghost Skill',
                description: 'Sem tipo',
                icon: 'ghost.png',
                cooldown: 1,
                base_damage: 10,
                type_id: 'invalido',
            }),
        ).rejects.toThrow();
    });
});
