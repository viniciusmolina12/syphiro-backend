import { ValueObject } from "../../@shared/value-object";

export class InstanceId extends ValueObject {
    public readonly value: number;
    private constructor(value: number) {
        super();
        this.value = value;
    }
}

export class Instance {
    private constructor(
        public readonly id: InstanceId,
    ) {
        this.id = id;
    }
}