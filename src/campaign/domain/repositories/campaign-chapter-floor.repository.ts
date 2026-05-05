import { CampaignChapterFloor, CampaignChapterFloorId } from '../entities/campaign-chapter-floor.entity';

export interface ICampaignChapterFloorRepository {
    findById(id: CampaignChapterFloorId): Promise<CampaignChapterFloor | null>;
}
