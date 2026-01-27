export abstract class ValueObject {
    equals(valueObject: ValueObject): boolean {
        return this === valueObject;
    }
}