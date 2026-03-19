import { Enemy, EnemyId } from "../enemy.aggregate";

export interface IEnemyRepository {
    findById(id: EnemyId): Promise<Enemy | null>;
    save(enemy: Enemy): Promise<void>;
}