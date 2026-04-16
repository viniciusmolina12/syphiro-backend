import { IEventHandler } from '../../../@shared/application/event-handler.interface';
import { EnemyDiedEvent } from '../../../enemy/domain/events/enemy-died.event';
import { ICombatRepository } from '../../domain/repositories/combat.repository';

export class OnEnemyDiedHandler implements IEventHandler<EnemyDiedEvent> {
    readonly eventName = 'EnemyDied';

    constructor(private readonly combatRepository: ICombatRepository) {}

    async handle(event: EnemyDiedEvent): Promise<void> {
        const combat = await this.combatRepository.findByEnemyId(event.enemyId);
        if (!combat) return;

        // TODO: encerrar o combate, calcular recompensas, etc.
        console.log(`Combate ${combat.id} encerrado: enemy ${event.enemyId} morreu.`);
    }
}
