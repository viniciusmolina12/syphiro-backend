export class InstanceFullError extends Error {
    constructor() {
        super('A instância já atingiu o número máximo de jogadores');
        this.name = 'InstanceFullError';
    }
}
