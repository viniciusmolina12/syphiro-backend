export class InstanceNotPendingError extends Error {
    constructor() {
        super('A instância não está mais aceitando jogadores');
        this.name = 'InstanceNotPendingError';
    }
}
