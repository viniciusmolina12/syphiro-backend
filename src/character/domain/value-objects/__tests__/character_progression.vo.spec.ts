import { InvalidProgressionError, PROGRESSION_RULES } from "../../../../@shared/domain/progression.vo";
import { CharacterProgression } from "../character_progression.vo";

describe('CharacterProgression Value Object', () => {
    it('should be able to create a character progression', () => {
        const [characterProgression, error] = CharacterProgression.create<CharacterProgression>(6401).asArray();
        console.log(characterProgression.level);
        console.log(characterProgression.experience_to_next_level);
        expect(error).toBeNull();
    });

    it('should be able to gain experience', () => {
        const [characterProgression, _] = CharacterProgression.create<CharacterProgression>(6400).asArray();
        const characterProgressionWithExperience = characterProgression.gainExperience(100);
        expect(characterProgressionWithExperience['experience']	).toBe(6500);
    });

    it('should not be able to gain negative experience', () => {
        const [characterProgression, _] = CharacterProgression.create<CharacterProgression>(6400).asArray();
        const characterProgressionWithExperience = characterProgression.gainExperience(-100);
        expect(characterProgressionWithExperience['experience']).toBe(6400);
    });

    it('should not be able to create a character progression with negative experience', () => {
        const [_, error] = CharacterProgression.create<CharacterProgression>(-100).asArray();
        expect(error).toBeInstanceOf(InvalidProgressionError);
        expect(error.message).toBe(PROGRESSION_RULES.MIN_EXPERIENCE.message);
    });

    it('should be able to level up', () => {
        const [characterProgression, _] = CharacterProgression.create<CharacterProgression>(6300).asArray();
        expect(characterProgression.level).toBe(16);
        const characterProgressionWithExperience = characterProgression.gainExperience(100);
        expect(characterProgressionWithExperience.level).toBe(17);
    });
});