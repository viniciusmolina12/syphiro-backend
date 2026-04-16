import { IDomainEvent } from '../domain/domain-event.interface';

export interface IEventBus {
    publish(event: IDomainEvent): Promise<void>;
    publishAll(events: IDomainEvent[]): Promise<void>;
}
