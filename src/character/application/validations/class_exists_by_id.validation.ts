import { Either } from "../../../@shared/either";
import { Class, ClassId } from "../../domain/entities/class";
import { IClassRepository } from "../../domain/repositories/class.repository";

export class ClassExistsByIdValidation {
    constructor(private readonly classRepository: IClassRepository) {}

    async validate(class_id: ClassId): Promise<Either<Class, Error>> {
        const class_entity = await this.classRepository.findById(class_id);
        return Either.safe(() => {
            if (!class_entity) {
                throw new ClassNotFoundError('Class not found');
            }
            return class_entity;
        });
    }
}

export class ClassNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClassNotFoundError';
    }
}