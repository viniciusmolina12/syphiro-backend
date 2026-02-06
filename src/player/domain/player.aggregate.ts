import { Either } from "../../@shared/either";
import { EntityId } from "../../@shared/entity-id.vo";
import { IdentityId } from "./value-objects/identity_id.vo";
import { Name } from "./value-objects/name.vo";

export class PlayerId extends EntityId {}

export class Player {
    private constructor(
        public readonly id: PlayerId,
        public readonly identityId: IdentityId,
        public readonly name: Name,
    ) {
        this.id = id;
        this.name = name;
    }

    static create(id: PlayerId, identityId: IdentityId, name: Name): Either<Player, Error> {
        return Either.safe(() => new Player(id, identityId, name));
    }
}