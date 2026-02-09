export class Notification {
    private readonly errors: string[] = [];

    addError(error: string) {
        this.errors.push(error);
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    getErrorsMessages() {
        return this.errors.join(', ');
    }
}