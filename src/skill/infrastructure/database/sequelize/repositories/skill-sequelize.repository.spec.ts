import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';
import { SkillTypeModel, skillTypeModelSynced } from '../models/skill-type.model';
import { SkillModel, skillModelSynced } from '../models/skill.model';
import { SkillSequelizeRepository } from './skill-sequelize.repository';
import { Skill, SkillId, SkillType } from '@skill/domain/skill.entity';

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const UNKNOWN_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('SkillSequelizeRepository', () => {
    let repository: SkillSequelizeRepository;

    beforeEach(async () => {
     
        await SEQUELIZE_CONFIG.truncate();
        repository = new SkillSequelizeRepository();
    });

    afterAll(async () => {
        await SEQUELIZE_CONFIG.truncate();
    })
    describe('findById', () => {
        it('deve retornar a skill quando encontrada', async () => {
            await SkillTypeModel.create({ id: SkillType.ATTACK, description: 'Ataque' });
            await SkillModel.create({
                id: VALID_ID,
                name: 'Fireball',
                description: 'Lança uma bola de fogo',
                icon: 'fireball.png',
                cooldown: 3,
                base_damage: 50,
                type_id: SkillType.ATTACK,
            });
            const result = await repository.findById(new SkillId(VALID_ID));

            expect(result).toBeInstanceOf(Skill);
            expect(result!.id.toString()).toBe(VALID_ID);
            expect(result!.name).toBe('Fireball');
            expect(result!.type).toBe(SkillType.ATTACK);
        });

        it('deve retornar null quando a skill não existe', async () => {
            const result = await repository.findById(new SkillId(UNKNOWN_ID));

            expect(result).toBeNull();
        });
    });
});
