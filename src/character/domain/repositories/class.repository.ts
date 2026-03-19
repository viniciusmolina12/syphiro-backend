import { Class } from "../../../class/domain/class.aggregate";
import { ClassId } from "../../../class/domain/class.aggregate";

export interface IClassRepository {
    findById(id: ClassId): Promise<Class | null>;
}