import { EntityId } from "../../@shared/entity-id.vo";

export class InventoryId extends EntityId {}

export class Inventory {
    private constructor(
        public readonly id: InventoryId, 
    ) {
        this.id = id;
    }

    static empty(): Inventory {
        return new Inventory(new InventoryId());
    }
} 