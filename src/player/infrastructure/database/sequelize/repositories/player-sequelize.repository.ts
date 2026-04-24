import { IPlayerRepository } from "@player/domain/repositories/player.repository";
import { PlayerModel } from "../models/player.model";
import { Player } from "@player/domain/player.aggregate";
import { IdentityId } from "@player/domain/value-objects/identity_id.vo";
import { PlayerModelMapper } from "./player-model.mapper";

export class PlayerSequelizeRepository implements IPlayerRepository {

    async findByIdentityId(identityId: IdentityId): Promise<Player | null> {
        const player = await PlayerModel.findOne({ where: { identity_id: identityId.value } });
        if (!player) return null;
        
        return PlayerModelMapper.toDomain(player);
    }

    async existsByIdentityId(identityId: IdentityId): Promise<boolean> {
        const player = await PlayerModel.findOne({ where: { identity_id: identityId.value } });
        return !!player;
    }

    async save(player: Player): Promise<void> {
        await PlayerModel.create({
            id: player.id.toString(),
            name: player.name.value,
            identity_id: player.identity_id.value,
        });
    }
}