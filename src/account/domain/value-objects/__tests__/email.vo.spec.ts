import { Email, EMAIL_RULES, InvalidEmailError } from "../email.vo";

describe('Email tests', () => {
    it('should create a valid email', () => {
        const [email, error] = Email.create('test@test.com').asArray();
        expect(error).toBeNull();
        expect(email.value).toBe('test@test.com');
    });

    it('should not create an invalid email', () => {
        const [_, error] = Email.create('invalid_email').asArray();
        expect(error).toBeInstanceOf(InvalidEmailError);
        expect(error.message).toBe(EMAIL_RULES.INVALID.message);
    });

    it('should not create an email with less than 8 characters', () => {
        const [_, error] = Email.create('a@a.com').asArray();
        expect(error).toBeInstanceOf(InvalidEmailError);
        expect(error.message).toBe(EMAIL_RULES.TOO_SHORT.message);
    });
    
    it('should not create an email with more than 255 characters', () => {
        const [_, error] = Email.create('a'.repeat(256) + '@test.com').asArray();
        expect(error).toBeInstanceOf(InvalidEmailError);
        expect(error.message).toBe(EMAIL_RULES.TOO_LONG.message);
    });
});