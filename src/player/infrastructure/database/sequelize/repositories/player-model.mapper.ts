import { Player, PlayerId } from "@player/domain/player.aggregate";
import { IdentityId } from "@player/domain/value-objects/identity_id.vo";
import { PlayerModel } from "../models/player.model";
import { Name } from "@player/domain/value-objects/name.vo";

export class PlayerModelMapper {
    static toDomain(model: PlayerModel): Player {
        return Player.rehydrate({
            id: new PlayerId(model.id),
            identity_id:  new IdentityId(model.identity_id),
            name: Name.create(model.name).ok,
        });
    }

    static toModel(player: Player): PlayerModel {
        return new PlayerModel({
            id: player.id.toString(),
            name: player.name.value,
            identity_id: player.identity_id.value,
        });
    }
}