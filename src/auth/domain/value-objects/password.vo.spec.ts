import { Password, InvalidPasswordError, PASSWORD_RULES } from './password.vo';

describe('Password', () => {
    describe('create', () => {
        it('deve criar uma senha válida', () => {
            const result = Password.create('SecurePass123');

            expect(result.ok).toBeInstanceOf(Password);
            expect(result.ok.value).toBe('SecurePass123');
        });

        it('deve falhar com senha vazia', () => {
            const result = Password.create('');

            expect(result.error).toBeInstanceOf(InvalidPasswordError);
            expect(result.error.message).toBe(PASSWORD_RULES.MIN_LENGTH.message);
        });

        it(`deve falhar com senha menor que ${PASSWORD_RULES.MIN_LENGTH.value} caracteres`, () => {
            const result = Password.create('1234567');

            expect(result.error).toBeInstanceOf(InvalidPasswordError);
            expect(result.error.message).toBe(PASSWORD_RULES.MIN_LENGTH.message);
        });

        it(`deve aceitar senha com exatamente ${PASSWORD_RULES.MIN_LENGTH.value} caracteres`, () => {
            const result = Password.create('12345678');

            expect(result.ok).toBeInstanceOf(Password);
        });

        it(`deve falhar com senha maior que ${PASSWORD_RULES.MAX_LENGTH.value} caracteres`, () => {
            const result = Password.create('a'.repeat(PASSWORD_RULES.MAX_LENGTH.value + 1));

            expect(result.error).toBeInstanceOf(InvalidPasswordError);
            expect(result.error.message).toBe(PASSWORD_RULES.MAX_LENGTH.message);
        });
    });

    describe('equals', () => {
        it('deve retornar true para senhas com o mesmo valor', () => {
            const p1 = Password.create('SecurePass123').ok;
            const p2 = Password.create('SecurePass123').ok;

            expect(p1.equals(p2)).toBe(true);
        });

        it('deve retornar false para senhas diferentes', () => {
            const p1 = Password.create('SecurePass123').ok;
            const p2 = Password.create('OtherPass456').ok;

            expect(p1.equals(p2)).toBe(false);
        });
    });
});
