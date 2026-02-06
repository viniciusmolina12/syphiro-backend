import { ValueObject } from "../../../@shared/value-object";

export class IdentityId extends ValueObject {
    public readonly value: string;
    private constructor(value: string) {
        super();
        this.value = value;
    }
}