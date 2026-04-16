import { EntityId } from "../../@shared/entity-id.vo";

export class SkillId extends EntityId {}

export enum SkillType {
    PASSIVE = 'PASSIVE',
    ATTACK = 'ATTACK',
    DEFENSE = 'DEFENSE',
    UTILITY = 'UTILITY',
}

interface SkillConstructorProps {
    id?: SkillId;
    name: string;
    description: string;
    icon: string;
    cooldown: number;
    base_damage: number;
    type: SkillType;
}

export interface SkillCreateCommand {
    name: string;
    description: string;
    icon: string;
    cooldown: number;
    base_damage: number;
    type: SkillType;
}

export class Skill {
    public readonly id: SkillId;
    public readonly name: string;
    public readonly description: string;
    public readonly icon: string;
    public readonly cooldown: number;
    public readonly base_damage: number;
    public readonly type: SkillType;

    private constructor(props: SkillConstructorProps) {
        this.id = props.id ?? new SkillId();
        this.name = props.name;
        this.description = props.description;
        this.icon = props.icon;
        this.cooldown = props.cooldown;
        this.base_damage = props.base_damage;
        this.type = props.type;
    }

    static create(command: SkillCreateCommand): Skill {
        return new Skill(command);
    }
}
