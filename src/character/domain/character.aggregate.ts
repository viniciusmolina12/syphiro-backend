import { EntityId } from "../../@shared/entity-id.vo";
import { InstanceId } from "../../instance/domain/instance.aggregate";
import { Class } from "./entities/class";
import { Inventory } from "./entities/inventory";
import { CharacterProgression } from "./value-objects/character_progression.vo";
import { ProfessionProgression } from "./value-objects/profession_progression.vo";
import { Either } from "../../@shared/either";
import { PlayerId } from "../../player/domain/player.aggregate";
import { AggregateRoot } from "../../@shared/domain/aggregate-root";

export class CharacterId extends EntityId {}

interface CharacterConstructorProps {
    id?: CharacterId;
    instance_id: InstanceId;
    class: Class;
    inventory?: Inventory;
    progression?: CharacterProgression;
    professions_progressions?: ProfessionProgression[];
    player_id: PlayerId;
}

interface CharacterCreateCommand {
    player_id: PlayerId;
    instance_id: InstanceId;
    class: Class;
}

export class Character extends AggregateRoot { 

    public readonly id: CharacterId;
    public readonly instance_id: InstanceId;
    public readonly class: Class;
    public readonly inventory: Inventory;
    public readonly progression: CharacterProgression;
    public readonly professions_progressions: ProfessionProgression[];
    public readonly player_id: PlayerId;

    private constructor(
        props: CharacterConstructorProps,
    ) {
        super();
        this.id = props.id ?? new CharacterId();
        this.instance_id = props.instance_id;
        this.class = props.class;   
        this.inventory = props.inventory ?? Inventory.empty();
        this.progression = props.progression ?? CharacterProgression.create<CharacterProgression>(0).ok;
        this.professions_progressions = props.professions_progressions ?? [];
        this.player_id = props.player_id;
    }

    static create(command: CharacterCreateCommand): Either<Character, Error> {
        return Either.safe(() => new Character({ instance_id: command.instance_id, class: command.class, player_id: command.player_id }));
    }
}   