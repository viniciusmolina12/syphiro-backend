import { IDomainEvent } from '@shared/domain/domain-event.interface';
import { PlayerId } from '@player/domain/player.aggregate';

export class PlayerCreatedEvent implements IDomainEvent {
    public readonly occurredAt: Date;
    public readonly eventName = 'PlayerCreated';

    public readonly playerId: PlayerId;
    public readonly identityId: string;
    public readonly name: string;

    constructor(payload: { playerId: PlayerId; identityId: string; name: string }) {
        this.occurredAt = new Date();
        this.playerId = payload.playerId;
        this.identityId = payload.identityId;
        this.name = payload.name;
    }
}
