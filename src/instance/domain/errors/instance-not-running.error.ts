export class InstanceNotRunningError extends Error {
    constructor() {
        super('A instância precisa estar em andamento para ser concluída');
        this.name = 'InstanceNotRunningError';
    }
}
