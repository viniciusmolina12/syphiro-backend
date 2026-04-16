import { Either } from '@shared/either';
import { PlayerId } from '@player/domain/player.aggregate';
import { InstanceNotFoundError, InstanceNotPendingError, NotInstanceCreatorError } from '@instance/domain/errors';
import { Instance, InstanceId } from '@instance/domain/instance.aggregate';
import { IInstanceRepository } from '@instance/domain/repositories/instance.repository';
import { InstanceExistsByIdValidation } from '@instance/application/validations/instance_exists_by_id.validation';

interface AbandonInstanceInput {
    player_id: PlayerId;
    instance_id: string;
}

type AbandonInstanceError =
    | InstanceNotFoundError
    | NotInstanceCreatorError
    | InstanceNotPendingError;

export class AbandonInstanceUsecase {
    constructor(
        private readonly instanceRepository: IInstanceRepository,
        private readonly instanceExistsByIdValidation: InstanceExistsByIdValidation,
    ) {}

    async execute(input: AbandonInstanceInput): Promise<Either<Instance, AbandonInstanceError>> {
        const [_, instance_not_exists] = (
            await this.instanceExistsByIdValidation.validate(new InstanceId(input.instance_id))
        ).asArray();
        if (instance_not_exists) return Either.fail(instance_not_exists);

        const instance = await this.instanceRepository.findById(new InstanceId(input.instance_id));
        if (!instance) return Either.fail(new InstanceNotFoundError());

        if (!instance.player_id.equals(input.player_id)) return Either.fail(new NotInstanceCreatorError());

        const abandon_result = instance.abandon();
        if (abandon_result.isFail()) return Either.fail(abandon_result.error);

        await this.instanceRepository.update(instance);
        return Either.ok(instance);
    }
}
