export class InsufficientPlayersError extends Error {
    constructor() {
        super('A instância precisa de pelo menos 3 jogadores para iniciar');
        this.name = 'InsufficientPlayersError';
    }
}
