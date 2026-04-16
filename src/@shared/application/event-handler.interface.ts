import { IDomainEvent } from '../domain/domain-event.interface';

export interface IEventHandler<T extends IDomainEvent = IDomainEvent> {
    eventName: string;
    handle(event: T): Promise<void>;
}
