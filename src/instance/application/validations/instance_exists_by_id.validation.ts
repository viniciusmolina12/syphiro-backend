import { Either } from "../../../@shared/either";
import { InstanceNotFoundError } from "../../domain/errors/instance-not-found.error";
import { InstanceId } from "../../domain/instance.aggregate";
import { IInstanceRepository } from "../../domain/repositories/instance.repository";

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
