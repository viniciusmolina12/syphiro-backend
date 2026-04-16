import { Either } from '../../../../@shared/either';
import { PlayerId } from '../../../../player/domain/player.aggregate';
import { InstanceFullError, InstanceNotFoundError, InstanceNotPendingError, PlayerAlreadyInInstanceError } from '../../../domain/errors';
import { Instance, InstanceId } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceExistsByIdValidation } from '../../validations/instance_exists_by_id.validation';

interface JoinInstanceInput {
    player_id: PlayerId;
    instance_id: string;
}

type JoinInstanceError =
    | InstanceNotFoundError
    | InstanceNotPendingError
    | InstanceFullError
    | PlayerAlreadyInInstanceError;

export class JoinInstanceUsecase {
    constructor(private readonly instanceRepository: IInstanceRepository, private readonly instanceExistsByIdValidation: InstanceExistsByIdValidation) {}

    async execute(input: JoinInstanceInput): Promise<Either<Instance, JoinInstanceError>> {
        const [_, instance_not_exists] = (await this.instanceExistsByIdValidation.validate(new InstanceId(input.instance_id))).asArray();
        if (instance_not_exists) return Either.fail(instance_not_exists);

        const instance = await this.instanceRepository.findById(new InstanceId(input.instance_id));
        if (!instance) return Either.fail(new InstanceNotFoundError());

        const active_instance = await this.instanceRepository.findActiveByPlayerId(input.player_id);
        if (active_instance) return Either.fail(new PlayerAlreadyInInstanceError());

        if (!instance.isPending()) return Either.fail(new InstanceNotPendingError());
        if (instance.isFull()) return Either.fail(new InstanceFullError());

        instance.addParticipant(input.player_id);
        await this.instanceRepository.update(instance);
        return Either.ok(instance);
    }
}
