import { EntityId } from '@shared/entity-id.vo';
import { EnemyId } from '@enemy/domain/enemy.aggregate';

export class CampaignChapterFloorId extends EntityId {}

interface CampaignChapterFloorConstructorProps {
    id?: CampaignChapterFloorId;
    floor_number: number;
    enemy_id: EnemyId;
}

export interface CreateCampaignChapterFloorCommand {
    floor_number: number;
    enemy_id: EnemyId;
}

export class CampaignChapterFloor {
    public readonly id: CampaignChapterFloorId;
    public readonly floor_number: number;
    public readonly enemy_id: EnemyId;

    private constructor(props: CampaignChapterFloorConstructorProps) {
        this.id = props.id ?? new CampaignChapterFloorId();
        this.floor_number = props.floor_number;
        this.enemy_id = props.enemy_id;
    }

    static create(command: CreateCampaignChapterFloorCommand): CampaignChapterFloor {
        return new CampaignChapterFloor(command);
    }

    static rehydrate(props: CampaignChapterFloorConstructorProps): CampaignChapterFloor {
        return new CampaignChapterFloor(props);
    }
}
