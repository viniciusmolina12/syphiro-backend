export class SkillNotOwnedError extends Error {
    constructor() { super('O personagem não possui esta skill'); }
}
