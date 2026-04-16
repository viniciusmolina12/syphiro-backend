import { Either } from '@shared/either';
import { AggregateRoot } from '@shared/domain/aggregate-root';
import { EntityId } from '@shared/entity-id.vo';
import { IdentityId, InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { InvalidNameError, Name } from '@player/domain/value-objects/name.vo';
import { PlayerCreatedEvent } from '@player/domain/events/player-created.event';

export class PlayerId extends EntityId {}

export interface CreatePlayerCommand {
    identityId: string;
    name: string;
}

export class Player extends AggregateRoot {
    private constructor(
        public readonly id: PlayerId,
        public readonly identityId: IdentityId,
        public readonly name: Name,
    ) {
        super();
    }

    static create(command: CreatePlayerCommand): Either<Player, InvalidIdentityIdError | InvalidNameError> {
        const [identityId, identityIdError] = IdentityId.create(command.identityId).asArray();
        if (identityIdError) return Either.fail(identityIdError);

        const [name, nameError] = Name.create(command.name).asArray();
        if (nameError) return Either.fail(nameError);

        const player = new Player(new PlayerId(), identityId, name);
        player.addDomainEvent(
            new PlayerCreatedEvent({
                playerId: player.id,
                identityId: identityId.value,
                name: name.value,
            }),
        );
        return Either.ok(player);
    }
}
