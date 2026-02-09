import { Class } from "../entities/class";
import { ClassId } from "../entities/class";

export interface IClassRepository {
    findById(id: ClassId): Promise<Class | null>;
}