export class ExpiredConfirmationCodeError extends Error {
    constructor() {
        super('The confirmation code has expired');
        this.name = 'ExpiredConfirmationCodeError';
    }
}
