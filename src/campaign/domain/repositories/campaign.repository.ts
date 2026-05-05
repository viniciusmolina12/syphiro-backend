import { Campaign, CampaignId } from '@campaign/domain/campaign.aggregate';

export interface ICampaignRepository {
    findById(id: CampaignId): Promise<Campaign | null>;
    save(campaign: Campaign): Promise<void>;
    update(campaign: Campaign): Promise<void>;
}
