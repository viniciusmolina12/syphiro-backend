import { EntityId } from "../../@shared/entity-id.vo";

export class ProfessionId extends EntityId {}

export class Profession {
    private constructor(
        public readonly id: ProfessionId,
    ) {
        this.id = id;
    }
}