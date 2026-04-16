import { Either } from '../../../../@shared/either';
import { PlayerId } from '../../../../player/domain/player.aggregate';
import { InstanceFullError } from '../../../domain/errors/instance-full.error';
import { InstanceNotFoundError } from '../../../domain/errors/instance-not-found.error';
import { InstanceNotPendingError } from '../../../domain/errors/instance-not-pending.error';
import { PlayerAlreadyInInstanceError } from '../../../domain/errors/player-already-in-instance.error';
import { Instance, InstanceId } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';

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
    constructor(private readonly instanceRepository: IInstanceRepository) {}

    async execute(input: JoinInstanceInput): Promise<Either<Instance, JoinInstanceError>> {
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
