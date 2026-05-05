import { ISkillRepository } from '@skill/domain/repositories/skill.repository';
import { Skill, SkillId } from '@skill/domain/skill.entity';
import { SkillModel } from '../models/skill.model';
import { SkillTypeModel } from '../models/skill-type.model';
import { SkillModelMapper } from './skill-model.mapper';

export class SkillSequelizeRepository implements ISkillRepository {
    async findById(id: SkillId): Promise<Skill | null> {
        try {
        const model = await SkillModel.findByPk(id.toString(), {
            include: [{ model: SkillTypeModel, as: 'skill_type' }],
        });
        if (!model) return null;

        return SkillModelMapper.toDomain(model as SkillModel & { skill_type: SkillTypeModel });
        }catch(e) {
            console.log('error do carai', e)
            return null
        } 

        
    }
}
