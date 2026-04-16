import { IDomainEvent } from '@shared/domain/domain-event.interface';

export interface IEventBus {
    publish(event: IDomainEvent): Promise<void>;
    publishAll(events: IDomainEvent[]): Promise<void>;
}
