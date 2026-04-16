import { IDomainEvent } from './domain-event.interface';
import { Entity } from './entity';

export abstract class AggregateRoot extends Entity {
    private _domainEvents: IDomainEvent[] = [];

    get domainEvents(): IDomainEvent[] {
        return [...this._domainEvents];
    }

    protected addDomainEvent(event: IDomainEvent): void {
        this._domainEvents.push(event);
    }

    clearDomainEvents(): void {
        this._domainEvents = [];
    }
}
