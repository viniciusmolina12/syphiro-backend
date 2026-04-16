import { Either } from "@shared/either";
import { InstanceNotFoundError } from "@instance/domain/errors";
import { InstanceId } from "@instance/domain/instance.aggregate";
import { IInstanceRepository } from "@instance/domain/repositories/instance.repository";

export class InstanceExistsByIdValidation {
    constructor(private readonly instanceRepository: IInstanceRepository) {}

    async validate(instance_id: InstanceId): Promise<Either<boolean, Error>> {
        const exists = await this.instanceRepository.existsById(instance_id);
        return Either.safe(() => {
            if (!exists) {
                throw new InstanceNotFoundError();
            }
            return true;
        });
    }
}
