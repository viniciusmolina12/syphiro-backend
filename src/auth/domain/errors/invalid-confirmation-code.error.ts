export class InvalidConfirmationCodeError extends Error {
    constructor() {
        super('The confirmation code is invalid');
        this.name = 'InvalidConfirmationCodeError';
    }
}
