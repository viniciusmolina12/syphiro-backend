import { Progression } from "../../../@shared/domain/progression.vo";
import { ProfessionId } from "../../../profession/profession.aggregate";

export class ProfessionProgression extends Progression {
    private constructor(
    protected readonly experience: number,
    public readonly profession_id: ProfessionId
    ) {
      super(experience);
    }
}