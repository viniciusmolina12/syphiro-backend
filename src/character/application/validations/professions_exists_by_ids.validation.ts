import { Either } from "../../../@shared/either";
import { Profession, ProfessionId } from "../../../profession/domain/profession.aggregate";
import { IProfessionRepository } from "../../domain/repositories/profession.repository";

export class ProfessionsExistsByIdsValidation {
    constructor(private readonly professionRepository: IProfessionRepository) {}

    async validate(ids: string[]): Promise<Either<Profession[], Error>> {
        const professions_ids = ids.map(id => new ProfessionId(id));
        const professions = await this.professionRepository.findByIds(professions_ids);
        return Either.safe(() => {
            const professions_not_found = professions_ids.filter(id => !professions.some(profession => profession.id.equals(id)));
            if(professions_not_found.length > 0) {
                throw new ProfessionsNotFoundError(professions_not_found.map(id => id.toString()).join(', '));
            }
            return professions;
        });
    }
}

export class ProfessionsNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfessionsNotFoundError';
    }
}