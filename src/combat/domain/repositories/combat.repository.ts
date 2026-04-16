import { EnemyId } from "../../../enemy/domain/enemy.aggregate";
import { Combat, CombatId } from "../combat.aggregate";

export interface ICombatRepository {
    findById(id: CombatId): Promise<Combat | null>;
    findByEnemyId(enemyId: EnemyId): Promise<Combat | null>;
    save(combat: Combat): Promise<void>;
    update(combat: Combat): Promise<void>;
}