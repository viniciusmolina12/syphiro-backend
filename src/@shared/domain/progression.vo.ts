import { Either } from "../either";
import { ValueObject } from "../value-object"

export const PROGRESSION_RULES = {
    MIN_EXPERIENCE: {
        message: 'Experience cannot be negative',
        value: 0,
    },
} as const;

export class Progression extends ValueObject {
    public constructor(
    protected readonly experience: number
    ) {
      super();
    }

    static create<T>(experience: number): Either<T, InvalidProgressionError> {
      return Either.safe<T, InvalidProgressionError>(() => {
        if (experience < 0) {
          throw new InvalidProgressionError(PROGRESSION_RULES.MIN_EXPERIENCE.message);
        }
        return new Progression(experience) as T;
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
  
    gainExperience(amount: number): Progression {
      if (amount <= 0) return this;
      return new Progression(this.experience + amount);
    }
  
    private experienceToNextLevel(level: number): number {
      const base = 100;
      const factor = 1.5;
      return Math.floor(base * Math.pow(level, factor));
    }
  }
  

export class InvalidProgressionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidProgressionError';
    }
}