import { Combat, CombatId } from "../combat.aggregate";

export interface ICombatRepository {
    findById(id: CombatId): Promise<Combat | null>;
    save(combat: Combat): Promise<void>;
}