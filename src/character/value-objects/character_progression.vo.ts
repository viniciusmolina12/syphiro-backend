import { Progression } from "../../@shared/domain/progression.vo";


export class CharacterProgression extends Progression {
    private constructor(
    protected readonly experience: number
    ) {
      super(experience);
    }
  
}
