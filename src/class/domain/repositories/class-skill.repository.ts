import { ClassSkill, ClassSkillId } from "../class_skill";

export interface IClassSkillRepository {
    findById(id: ClassSkillId): Promise<ClassSkill | null>;
}
