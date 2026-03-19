import { EntityId } from "../../@shared/entity-id.vo";

export class ClassSkillId extends EntityId {}

export enum SkillType {
    PASSIVE = 'PASSIVE',
    ATTACK = 'ATTACK',
    DEFENSE = 'DEFENSE',
    UTILITY = 'UTILITY',
}

interface ClassSkillConstructorProps {
    id?: ClassSkillId;
    name: string;
    description: string;
    icon: string;
    cooldown: number;
    base_damage: number;
    type: SkillType;
}

export interface ClassSkillCreateCommand {
    name: string;
    description: string;
    icon: string;
    cooldown: number;
    base_damage: number;
    type: SkillType;
}

export class ClassSkill {
    public readonly id: ClassSkillId;
    public readonly name: string;
    public readonly description: string;
    public readonly icon: string;
    public readonly cooldown: number;
    public readonly type: SkillType;
    public readonly base_damage: number;

    private constructor(props: ClassSkillConstructorProps) {
        this.id = props.id ?? new ClassSkillId();
        this.name = props.name;
        this.description = props.description;
        this.icon = props.icon;
        this.cooldown = props.cooldown;
        this.type = props.type;
        this.base_damage = props.base_damage;
    }

    static create(command: ClassSkillCreateCommand): ClassSkill {
        return new ClassSkill(command);
    }
}