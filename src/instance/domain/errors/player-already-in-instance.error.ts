export class PlayerAlreadyInInstanceError extends Error {
    constructor() {
        super('Jogador já está em uma instância ativa');
        this.name = 'PlayerAlreadyInInstanceError';
    }
}
