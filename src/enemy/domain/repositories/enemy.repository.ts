import { Enemy, EnemyId } from "../enemy.aggregate";

export interface IEnemyRepository {
    findById(id: EnemyId): Promise<Enemy | null>;
    existsByIds(ids: EnemyId[]): Promise<boolean>;
    save(enemy: Enemy): Promise<void>;
    update(enemy: Enemy): Promise<void>;
}