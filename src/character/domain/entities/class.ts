import { EntityId } from "../../../@shared/entity-id.vo";
import { ClassSkill } from "./class_skill";


export class ClassId extends EntityId {
    public constructor(value?: string) {
        super(value);
    }
}

interface ClassConstructorProps {
    id?: ClassId;
    name: string;
    description: string;
    icon: string;
    skills: ClassSkill[];
}

export class Class {
    public readonly id: ClassId;
    public readonly name: string;
    public readonly description: string;
    public readonly icon: string;
    public readonly skills: ClassSkill[];

    public constructor(props: ClassConstructorProps) {
        this.id = props.id ?? new ClassId();
        this.name = props.name;
        this.description = props.description;
        this.icon = props.icon;
        this.skills = props.skills;
    }

    
}