import { PlayerId } from '../../../player/domain/player.aggregate';
import { Instance, InstanceId } from '../instance.aggregate';

export interface IInstanceRepository {
    findById(id: InstanceId): Promise<Instance | null>;
    existsById(id: InstanceId): Promise<boolean>;
    findActiveByPlayerId(player_id: PlayerId): Promise<Instance | null>;
    save(instance: Instance): Promise<void>;
    update(instance: Instance): Promise<void>;
}
