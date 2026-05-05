import { Instance, InstanceId, InstanceStatus, InstanceDifficulty } from "@instance/domain/instance.aggregate";
import { PlayerId } from "@player/domain/player.aggregate";
import { CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";
import { InstanceModel } from "../models/instance.model";

export class InstanceModelMapper {
    static toDomain(model: InstanceModel): Instance {
        return Instance.rehydrate({
            id: new InstanceId(model.id),
            player_id: new PlayerId(model.player_id),
            status: model.status as InstanceStatus,
            difficulty: model.difficulty as InstanceDifficulty,
            campaign_chapter_floor_id: new CampaignChapterFloorId(model.campaign_chapter_floor_id),
            started_at: model.started_at,
            participants: (model.instanceParticipants ?? []).map(p => new PlayerId(p.player_id)),
        });
    }

    static toModel(instance: Instance): InstanceModel {
        return new InstanceModel({
            id: instance.id.toString(),
            player_id: instance.player_id.toString(),
            status: instance.status,
            difficulty: instance.difficulty,
            campaign_chapter_floor_id: instance.campaign_chapter_floor_id.toString(),
            started_at: instance.started_at,
        });
    }
}
