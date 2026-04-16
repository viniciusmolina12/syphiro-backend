import { EnemyId } from "@enemy/domain/enemy.aggregate";
import { IEnemyRepository } from "@enemy/domain/repositories/enemy.repository";

export class EnemiesExistsByIdsValidation {
    constructor(private readonly enemyRepository: IEnemyRepository) {}

    async validate(enemies_ids: EnemyId[]): Promise<boolean> {
        return this.enemyRepository.existsByIds(enemies_ids);
    }
}