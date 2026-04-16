import { Skill, SkillId } from "@skill/domain/skill.entity";

export interface ISkillRepository {
    findById(id: SkillId): Promise<Skill | null>;
}
