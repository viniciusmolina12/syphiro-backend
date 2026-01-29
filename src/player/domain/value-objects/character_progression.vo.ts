import { Either } from "../../../@shared/either";
import { ValueObject } from "../../../@shared/value-object";

export const CHARACTER_PROGRESSION_RULES = {
    MIN_EXPERIENCE: {
        message: 'Experience cannot be negative',
        value: 0,
    },
} as const;

export class CharacterProgression extends ValueObject {
    private constructor(
    private readonly experience: number
    ) {
      super();
    }
  
    static create(experience: number): Either<CharacterProgression, InvalidCharacterProgressionError> {
      return Either.safe(() => {
        if (experience < 0) {
          throw new InvalidCharacterProgressionError(CHARACTER_PROGRESSION_RULES.MIN_EXPERIENCE.message);
        }
        return new CharacterProgression(experience);
      });
    }
  
    get level(): number {
      let level = 1;
      while (this.experience >= this.experienceToNextLevel(level)) {
        level++;
      }
      return level;
    }
  
    get experience_to_next_level(): number {
      return this.experienceToNextLevel(this.level);
    }
  
    gainExperience(amount: number): CharacterProgression {
      if (amount <= 0) return this;
      return new CharacterProgression(this.experience + amount);
    }
  
    private experienceToNextLevel(level: number): number {
      const base = 100;
      const factor = 1.5;
      return Math.floor(base * Math.pow(level, factor));
    }
  }
  

export class InvalidCharacterProgressionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidCharacterProgressionError';
    }
}