import { EntityId } from "@shared/entity-id.vo";
import { Either } from "@shared/either";

export class ProfessionId extends EntityId {}

interface ProfessionConstructorProps {
    id: ProfessionId;
    name: string;
}
interface ProfessionCreateCommand {
    id: ProfessionId;
    name: string;
}
export class Profession {
    public readonly id: ProfessionId;
    public readonly name: string;
    private constructor(props: ProfessionConstructorProps) {    
        this.id = props.id ?? new ProfessionId();
        this.name = props.name;
    }
    

    static create(command: ProfessionCreateCommand): Either<Profession, Error> {
        return Either.safe(() => new Profession({ id: command.id, name: command.name }));
    }
}