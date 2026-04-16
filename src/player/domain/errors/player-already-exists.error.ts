export class PlayerAlreadyExistsError extends Error {
    constructor() {
        super('Já existe um player com esse identity ID');
        this.name = 'PlayerAlreadyExistsError';
    }
}
