import { Either } from '../../../../@shared/either';
import { PlayerId } from '../../../../player/domain/player.aggregate';
import { Instance, CreateInstanceCommand } from '../../../domain/instance.aggregate';
import { PlayerAlreadyHasActiveInstanceError } from '../../../domain/errors/player-already-has-active-instance.error';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceDifficulty } from '../../../domain/instance.aggregate';

interface CreateInstanceInput {
    player_id: PlayerId;
    difficulty: InstanceDifficulty;
}

export class CreateInstanceUsecase {
    constructor(private readonly instanceRepository: IInstanceRepository) {}

    async execute(input: CreateInstanceInput): Promise<Either<Instance, PlayerAlreadyHasActiveInstanceError>> {
        const active_instance = await this.instanceRepository.findActiveByPlayerId(input.player_id);
        if (active_instance) return Either.fail(new PlayerAlreadyHasActiveInstanceError());

        const instance = Instance.create({ player_id: input.player_id, difficulty: input.difficulty });
        await this.instanceRepository.save(instance);
        return Either.ok(instance);
    }
}
