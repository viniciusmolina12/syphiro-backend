export class CombatNotFoundError extends Error {
    constructor() { super('Combate não encontrado'); }
}

export class CombatantNotFoundError extends Error {
    readonly combatantId: string;
    constructor(id: string) {
        super(`Combatente ${id} não encontrado no combate`);
        this.combatantId = id;
    }
}

export class SkillNotFoundError extends Error {
    constructor() { super('Skill não encontrada') }
}

export class SkillNotOwnedError extends Error {
    constructor() { super('O personagem não possui esta skill') }
}

export class NotCombatantTurnError extends Error {
    constructor() { super('Não é a vez deste combatente') }
}