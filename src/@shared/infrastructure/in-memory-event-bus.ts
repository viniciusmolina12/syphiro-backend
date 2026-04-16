import { EventEmitter } from 'node:events';
import { IEventBus } from '@shared/application/event-bus.interface';
import { IEventHandler } from '@shared/application/event-handler.interface';
import { IDomainEvent } from '@shared/domain/domain-event.interface';

export class InMemoryEventBus implements IEventBus {
    private readonly emitter = new EventEmitter();

    register(handler: IEventHandler): void {
        this.emitter.on(handler.eventName, async (event: IDomainEvent) => {
            try {
                await handler.handle(event);
            } catch (error) {
                // O handler falhou, mas o dado já foi persistido.
                // Aqui você pode: logar, enviar para uma DLQ, acionar retry, etc.
                console.error(
                    `[EventBus] Handler "${handler.constructor.name}" falhou ao processar "${event.eventName}":`,
                    error,
                );
            }
        });
    }

    async publish(event: IDomainEvent): Promise<void> {
        this.emitter.emit(event.eventName, event);
    }

    async publishAll(events: IDomainEvent[]): Promise<void> {
        for (const event of events) {
            await this.publish(event);
        }
    }
}
