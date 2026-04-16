export class CombatantNotFoundError extends Error {
    readonly combatantId: string;
    constructor(id: string) {
        super(`Combatente ${id} não encontrado no combate`);
        this.combatantId = id;
    }
}
