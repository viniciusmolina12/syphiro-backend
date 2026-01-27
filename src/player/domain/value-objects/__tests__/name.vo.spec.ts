import { InvalidNameError, NAME_RULES, Name } from "../name.vo";

describe('Name Value Object', () => {
    it('should be able to create a name', () => {
        const[name, _] = Name.create('John Doe').asArray();
        expect(name.value).toBe('John Doe');
    });

    it('should not be able to create a name with less than 3 characters', () => {
        const[_, error] = Name.create('Jo').asArray();
        expect(error).toBeInstanceOf(InvalidNameError);
        expect(error.message).toBe(NAME_RULES.MIN_LENGTH.message);
    });

    it('should not be able to create a name with more than 255 characters', () => {
        const[_, error] = Name.create('a'.repeat(256)).asArray();
        expect(error).toBeInstanceOf(InvalidNameError);
        expect(error.message).toBe(NAME_RULES.MAX_LENGTH.message);
    });
    
});