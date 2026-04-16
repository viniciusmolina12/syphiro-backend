export class NotInstanceCreatorError extends Error {
    constructor() {
        super('Apenas o criador da instância pode iniciá-la');
        this.name = 'NotInstanceCreatorError';
    }
}
