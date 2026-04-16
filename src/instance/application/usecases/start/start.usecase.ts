import { Either } from '../../../../@shared/either';
import { PlayerId } from '../../../../player/domain/player.aggregate';
import { InstanceNotFoundError } from '../../../domain/errors/instance-not-found.error';
import { InstanceNotPendingError } from '../../../domain/errors/instance-not-pending.error';
import { InsufficientPlayersError } from '../../../domain/errors/insufficient-players.error';
import { NotInstanceCreatorError } from '../../../domain/errors/not-instance-creator.error';
import { Instance, InstanceId } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceExistsByIdValidation } from '../../validations/instance_exists_by_id.validation';

interface StartInstanceInput {
    player_id: PlayerId;
    instance_id: string;
}

type StartInstanceError =
    | InstanceNotFoundError
    | NotInstanceCreatorError
    | InstanceNotPendingError
    | InsufficientPlayersError;

export class StartInstanceUsecase {
    constructor(
        private readonly instanceRepository: IInstanceRepository,
        private readonly instanceExistsByIdValidation: InstanceExistsByIdValidation,
    ) {}

    async execute(input: StartInstanceInput): Promise<Either<Instance, StartInstanceError>> {
        const [_, instance_not_exists] = (
            await this.instanceExistsByIdValidation.validate(new InstanceId(input.instance_id))
        ).asArray();
        if (instance_not_exists) return Either.fail(instance_not_exists);

        const instance = await this.instanceRepository.findById(new InstanceId(input.instance_id));
        if (!instance) return Either.fail(new InstanceNotFoundError());

        if (!instance.player_id.equals(input.player_id)) return Either.fail(new NotInstanceCreatorError());

        if (!instance.isPending()) return Either.fail(new InstanceNotPendingError());

        const start_result = instance.start();
        if (start_result.isFail()) return Either.fail(start_result.error);

        await this.instanceRepository.update(instance);
        return Either.ok(instance);
    }
}
