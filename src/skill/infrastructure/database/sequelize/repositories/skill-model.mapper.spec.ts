import { SkillModel, skillModelSynced } from '../models/skill.model';
import { SkillTypeModel, skillTypeModelSynced } from '../models/skill-type.model';
import { SkillModelMapper } from './skill-model.mapper';
import { Skill, SkillId, SkillType } from '@skill/domain/skill.entity';
import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const makeSkillType = (): SkillTypeModel =>
    new SkillTypeModel({ id: SkillType.ATTACK, description: 'Ataque' });

const makeSkillModel = (): SkillModel & { skill_type: SkillTypeModel } => {
    const model = new SkillModel({
        id: VALID_ID,
        name: 'Fireball',
        description: 'Lança uma bola de fogo',
        icon: 'fireball.png',
        cooldown: 3,
        base_damage: 50,
        type_id: SkillType.ATTACK,
    });
    (model as any).skill_type = makeSkillType();
    return model as SkillModel & { skill_type: SkillTypeModel };
};

const makeSkill = (): Skill =>
    Skill.rehydrate({
        id: new SkillId(VALID_ID),
        name: 'Fireball',
        description: 'Lança uma bola de fogo',
        icon: 'fireball.png',
        cooldown: 3,
        base_damage: 50,
        type: SkillType.ATTACK,
    });

describe('SkillModelMapper', () => {

    describe('toDomain', () => {
        it('deve retornar uma instância de Skill', () => {
            const result = SkillModelMapper.toDomain(makeSkillModel());
            expect(result).toBeInstanceOf(Skill);
        });

        it('deve mapear o id corretamente', () => {
            const result = SkillModelMapper.toDomain(makeSkillModel());
            expect(result.id).toBeInstanceOf(SkillId);
            expect(result.id.toString()).toBe(VALID_ID);
        });

        it('deve mapear os campos de texto corretamente', () => {
            const result = SkillModelMapper.toDomain(makeSkillModel());
            expect(result.name).toBe('Fireball');
            expect(result.description).toBe('Lança uma bola de fogo');
            expect(result.icon).toBe('fireball.png');
        });

        it('deve mapear os campos numéricos corretamente', () => {
            const result = SkillModelMapper.toDomain(makeSkillModel());
            expect(result.cooldown).toBe(3);
            expect(result.base_damage).toBe(50);
        });

        it('deve mapear o type corretamente', () => {
            const result = SkillModelMapper.toDomain(makeSkillModel());
            expect(result.type).toBe(SkillType.ATTACK);
        });
    });

    describe('toModel', () => {
        it('deve retornar uma instância de SkillModel', () => {
            const result = SkillModelMapper.toModel(makeSkill());
            expect(result).toBeInstanceOf(SkillModel);
        });

        it('deve mapear o id corretamente', () => {
            const result = SkillModelMapper.toModel(makeSkill());
            expect(result.id).toBe(VALID_ID);
        });

        it('deve mapear os campos corretamente', () => {
            const result = SkillModelMapper.toModel(makeSkill());
            expect(result.name).toBe('Fireball');
            expect(result.description).toBe('Lança uma bola de fogo');
            expect(result.icon).toBe('fireball.png');
            expect(result.cooldown).toBe(3);
            expect(result.base_damage).toBe(50);
            expect(result.type_id).toBe(SkillType.ATTACK);
        });
    });
});
