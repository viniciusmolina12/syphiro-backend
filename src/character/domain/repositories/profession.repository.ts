import { Profession, ProfessionId } from "../../../profession/domain/profession.aggregate";

export interface IProfessionRepository {
    findByIds(professions_ids: ProfessionId[]): Promise<Profession[]>;
}