import { Either } from '@shared/either';
import { PlayerId } from '@player/domain/player.aggregate';
import { Instance, CreateInstanceCommand } from '@instance/domain/instance.aggregate';
import { PlayerAlreadyHasActiveInstanceError } from '@instance/domain/errors';
import { IInstanceRepository } from '@instance/domain/repositories/instance.repository';
import { InstanceDifficulty } from '@instance/domain/instance.aggregate';
import { CampaignChapterFloorId } from '@campaign/domain/entities/campaign-chapter-floor.entity';

interface CreateInstanceInput {
    player_id: PlayerId;
    difficulty: InstanceDifficulty;
    campaign_chapter_floor_id: CampaignChapterFloorId;
}
// TODO AO CRIAR A INSTANCIA, AO INVES DE PASSAR O FLOOR, PEGAR O PRIMEIRO FLOOR DO PRIMEIRO CHAPTER
export class CreateInstanceUsecase {
    constructor(private readonly instanceRepository: IInstanceRepository) {}

    async execute(input: CreateInstanceInput): Promise<Either<Instance, PlayerAlreadyHasActiveInstanceError>> {
        const active_instance = await this.instanceRepository.findActiveByPlayerId(input.player_id);
        if (active_instance) return Either.fail(new PlayerAlreadyHasActiveInstanceError());

        const instance = Instance.create({ player_id: input.player_id, difficulty: input.difficulty, campaign_chapter_floor_id: input.campaign_chapter_floor_id });
        await this.instanceRepository.save(instance);
        return Either.ok(instance);
    }
}
