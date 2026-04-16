export class PlayerAlreadyHasActiveInstanceError extends Error {
    constructor() {
        super('Jogador já possui uma instância ativa');
        this.name = 'PlayerAlreadyHasActiveInstanceError';
    }
}
