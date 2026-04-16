import { Skill, SkillId } from "../skill.entity";

export interface ISkillRepository {
    findById(id: SkillId): Promise<Skill | null>;
}
