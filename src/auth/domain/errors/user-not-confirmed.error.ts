export class UserNotConfirmedError extends Error {
    constructor() {
        super('User account has not been confirmed');
        this.name = 'UserNotConfirmedError';
    }
}
