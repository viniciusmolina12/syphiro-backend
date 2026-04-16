export class NotCombatantTurnError extends Error {
    constructor() { super('Não é a vez deste combatente'); }
}
