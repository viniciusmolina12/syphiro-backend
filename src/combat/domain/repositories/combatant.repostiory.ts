import { Combatant, CombatantId } from "../entities/combatant.entity";

export interface CombatantRepository {
    findById(id: CombatantId): Promise<Combatant | null>;
    save(combatant: Combatant): Promise<void>;
}
