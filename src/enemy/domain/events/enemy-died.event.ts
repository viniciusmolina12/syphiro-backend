import { IDomainEvent } from '@shared/domain/domain-event.interface';
import { EnemyId } from '@enemy/domain/enemy.aggregate';

export class EnemyDiedEvent implements IDomainEvent {
    readonly occurredAt: Date;
    readonly eventName = 'EnemyDied';

    constructor(public readonly enemyId: EnemyId) {
        this.occurredAt = new Date();
    }
}
