import { EntityId } from "../../@shared/entity-id.vo";
import { InstanceId } from "../../instance/domain/instance.aggregate";
import { Class } from "../../class/domain/class.aggregate";
import { Inventory } from "./entities/inventory";
import { CharacterProgression } from "./value-objects/character_progression.vo";
import { ProfessionProgression } from "./value-objects/profession_progression.vo";
import { Either } from "../../@shared/either";
import { PlayerId } from "../../player/domain/player.aggregate";
import { AggregateRoot } from "../../@shared/domain/aggregate-root";
import { SkillId } from "../../skill/domain/skill.entity";
import { Stats } from "./value-objects/stats.vo";

export class CharacterId extends EntityId {}

interface CharacterConstructorProps {
    id?: CharacterId;
    instance_id: InstanceId;
    class: Class;
    inventory?: Inventory;
    progression?: CharacterProgression;
    professions_progressions?: ProfessionProgression[];
    player_id: PlayerId;
    stats?: Stats;
}

interface CharacterCreateCommand {
    player_id: PlayerId;
    instance_id: InstanceId;
    class: Class;
    professions: ProfessionProgression[];
}

export const CHARACTER_RULES = {
    DEFAULT_HEALTH: {
        value: 100,
    },
} as const;

export class Character extends AggregateRoot { 

    public readonly id: CharacterId;
    public readonly instance_id: InstanceId;
    public readonly class: Class;
    public readonly inventory: Inventory;
    public readonly progression: CharacterProgression;
    public readonly professions_progressions: ProfessionProgression[];
    public readonly player_id: PlayerId;
    private _active: boolean;
    private _stats: Stats;

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
        this._stats = props.stats ?? Stats.create(CHARACTER_RULES.DEFAULT_HEALTH.value).ok;
        this._active = true;
    }

    static create(command: CharacterCreateCommand): Either<Character, Error> {
        return Either.safe(() => new Character({ instance_id: command.instance_id, class: command.class, player_id: command.player_id, professions_progressions: command.professions }));
    }

    hasSkill(skill_id: SkillId): boolean {
        return this.class.skills.some(s => s.id.equals(skill_id));
    }

    applyDamage(damage: number) {
       this._stats = this._stats.updateHealth(this._stats.health - damage);
       //EVENTO DE MORTE
       if (this.isDead()) {
        this.disable();
       }
    }

   public getHealth(): number {
    return this._stats.health;
   }

    public isDead(): boolean {
        return this._stats.health <= 0;
    }  
    
    public disable(): void {
        this._active = false;
    }
}   