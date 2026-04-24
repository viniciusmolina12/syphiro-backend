import { IDomainEvent } from '@shared/domain/domain-event.interface';
import { PlayerId } from '@player/domain/player.aggregate';

export class PlayerCreatedEvent implements IDomainEvent {
    public readonly occurredAt: Date;
    public readonly eventName = 'PlayerCreated';

    public readonly playerId: PlayerId;
    public readonly identity_id: string;
    public readonly name: string;

    constructor(payload: { playerId: PlayerId; identity_id: string; name: string }) {
        this.occurredAt = new Date();
        this.playerId = payload.playerId;
        this.identity_id = payload.identity_id;
        this.name = payload.name;
    }
}
