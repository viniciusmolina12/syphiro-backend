import { AggregateRoot } from "../../@shared/domain/aggregate-root";
import { EntityId } from "../../@shared/entity-id.vo";
import { Skill } from "../../skill/domain/skill.entity";


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
    skills: Skill[];
}

export class Class extends AggregateRoot {
    public readonly id: ClassId;
    public readonly name: string;
    public readonly description: string;
    public readonly icon: string;
    public readonly skills: Skill[];

    public constructor(props: ClassConstructorProps) {
        super();
        this.id = props.id ?? new ClassId();
        this.name = props.name;
        this.description = props.description;
        this.icon = props.icon;
        this.skills = props.skills;
    }

    
}