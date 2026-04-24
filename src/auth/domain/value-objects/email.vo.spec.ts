import { Email, InvalidEmailError } from './email.vo';

describe('Email', () => {
    describe('create', () => {
        it('deve criar um email válido', () => {
            const result = Email.create('user@example.com');

            expect(result.ok).toBeInstanceOf(Email);
            expect(result.ok.value).toBe('user@example.com');
        });

        it('deve normalizar o email para lowercase', () => {
            const result = Email.create('User@Example.COM');

            expect(result.ok.value).toBe('user@example.com');
        });

        it('deve remover espaços no início e fim', () => {
            const result = Email.create('  user@example.com  ');

            expect(result.ok.value).toBe('user@example.com');
        });

        it('deve falhar com email vazio', () => {
            const result = Email.create('');

            expect(result.error).toBeInstanceOf(InvalidEmailError);
        });

        it('deve falhar com email sem @', () => {
            const result = Email.create('invalidemail.com');

            expect(result.error).toBeInstanceOf(InvalidEmailError);
        });

        it('deve falhar com email sem domínio', () => {
            const result = Email.create('user@');

            expect(result.error).toBeInstanceOf(InvalidEmailError);
        });

        it('deve falhar com email sem usuário', () => {
            const result = Email.create('@example.com');

            expect(result.error).toBeInstanceOf(InvalidEmailError);
        });

        it('deve falhar com apenas espaços em branco', () => {
            const result = Email.create('   ');

            expect(result.error).toBeInstanceOf(InvalidEmailError);
        });
    });

    describe('equals', () => {
        it('deve retornar true para emails com o mesmo valor', () => {
            const email1 = Email.create('user@example.com').ok;
            const email2 = Email.create('user@example.com').ok;

            expect(email1.equals(email2)).toBe(true);
        });

        it('deve retornar false para emails diferentes', () => {
            const email1 = Email.create('user@example.com').ok;
            const email2 = Email.create('other@example.com').ok;

            expect(email1.equals(email2)).toBe(false);
        });
    });
});
