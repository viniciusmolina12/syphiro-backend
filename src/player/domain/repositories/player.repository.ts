import { Player } from '@player/domain/player.aggregate';
import { IdentityId } from '@player/domain/value-objects/identity_id.vo';

export interface IPlayerRepository {
    findByIdentityId(identityId: IdentityId): Promise<Player | null>;
    existsByIdentityId(identityId: IdentityId): Promise<boolean>;
    save(player: Player): Promise<void>;
}
