export class InstanceNotFoundError extends Error {
    constructor() {
        super('Instância não encontrada');
        this.name = 'InstanceNotFoundError';
    }
}
