import { Skill, SkillId, SkillType } from '@skill/domain/skill.entity';
import { SkillModel } from '../models/skill.model';
import { SkillTypeModel } from '../models/skill-type.model';

export class SkillModelMapper {
    static toDomain(model: SkillModel & { skill_type: SkillTypeModel }): Skill {
        return Skill.rehydrate({
            id: new SkillId(model.id),
            name: model.name,
            description: model.description,
            icon: model.icon,
            cooldown: model.cooldown,
            base_damage: model.base_damage,
            type: model.skill_type.id as SkillType,
        });
    }

    static toModel(skill: Skill): SkillModel {
        return new SkillModel({
            id: skill.id.toString(),
            name: skill.name,
            description: skill.description,
            icon: skill.icon,
            cooldown: skill.cooldown,
            base_damage: skill.base_damage,
            type_id: skill.type,
        });
    }
}
