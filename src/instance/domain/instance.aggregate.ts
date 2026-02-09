import { EntityId } from "../../@shared/entity-id.vo";

export class InstanceId extends EntityId {}

interface InstanceConstructorProps {
    id?: InstanceId;
}

export class Instance {
    public readonly id: InstanceId;
    private constructor(
        props?: InstanceConstructorProps,
    ) {
        this.id = props?.id ?? new InstanceId();
    }

    static create(): Instance {
        return new Instance();
    }
}