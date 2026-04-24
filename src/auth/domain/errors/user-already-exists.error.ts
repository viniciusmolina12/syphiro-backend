export class UserAlreadyExistsError extends Error {
    constructor() {
        super('A user with this email already exists');
        this.name = 'UserAlreadyExistsError';
    }
}
