import { Either } from '@shared/either';
import { AggregateRoot } from '@shared/domain/aggregate-root';
import { EntityId } from '@shared/entity-id.vo';
import { IdentityId, InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { InvalidNameError, Name } from '@player/domain/value-objects/name.vo';
import { PlayerCreatedEvent } from '@player/domain/events/player-created.event';

export class PlayerId extends EntityId {}

export interface PlayerConstructorProps {
    id: PlayerId;
    identity_id: IdentityId;
    name: Name;
}

export interface CreatePlayerCommand {
    identity_id: string;
    name: string;
}

export class Player extends AggregateRoot {
    public readonly id: PlayerId;
    public readonly identity_id: IdentityId;
    public readonly name: Name;
    private constructor(props: PlayerConstructorProps)
     {
        super();
        this.id = props.id;
        this.identity_id = props.identity_id;
        this.name = props.name;      
    }

    static create(command: CreatePlayerCommand): Either<Player, InvalidIdentityIdError | InvalidNameError> {
        const [identity_id, identityIdError] = IdentityId.create(command.identity_id).asArray();
        if (identityIdError) return Either.fail(identityIdError);

        const [name, nameError] = Name.create(command.name).asArray();
        if (nameError) return Either.fail(nameError);

        const player = new Player({ id: new PlayerId(), identity_id, name });
        player.addDomainEvent(
            new PlayerCreatedEvent({
                playerId: player.id,
                identity_id: identity_id.value,
                name: name.value,
            }),
        );
        return Either.ok(player);
    }


    static rehydrate(props: PlayerConstructorProps): Player {
        return new Player(
            { id: props.id, identity_id: props.identity_id, name: props.name },
        );
    }
}
