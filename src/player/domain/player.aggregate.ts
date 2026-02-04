import { Either } from "../../@shared/either";
import { EntityId } from "../../@shared/entity-id.vo";
import { Name } from "./value-objects/name.vo";

export class PlayerId extends EntityId {}

export class Player {
    private constructor(
        public readonly id: PlayerId,
        public readonly name: Name,
    ) {
        this.id = id;
        this.name = name;
    }

    static create(id: PlayerId, name: Name): Either<Player, Error> {
        return Either.safe(() => new Player(id, name));
    }
}