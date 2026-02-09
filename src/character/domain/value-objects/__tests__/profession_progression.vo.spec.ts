import { InvalidProgressionError, PROGRESSION_RULES } from "../../../../@shared/domain/progression.vo";
import { ProfessionProgression } from "../profession_progression.vo";

describe('ProfessionProgression Value Object', () => {
    it('should be able to create a profession progression', () => {
        const [_, error] = ProfessionProgression.create<ProfessionProgression>(6401).asArray();
        expect(error).toBeNull();
    });

    it('should not be able to create a profession progression with negative experience', () => {
        const [_, error] = ProfessionProgression.create<ProfessionProgression>(-100).asArray();
        expect(error).toBeInstanceOf(InvalidProgressionError);
        expect(error.message).toBe(PROGRESSION_RULES.MIN_EXPERIENCE.message);
    });

    it('should be able to gain experience', () => {
        const [professionProgression, _] = ProfessionProgression.create<ProfessionProgression>(6400).asArray();
        const professionProgressionWithExperience = professionProgression.gainExperience(100);
        expect(professionProgressionWithExperience['experience']).toBe(6500);
    });

    it('should not be able to gain negative experience', () => {
        const [professionProgression, _] = ProfessionProgression.create<ProfessionProgression>(6400).asArray();
        const professionProgressionWithExperience = professionProgression.gainExperience(-100);
        expect(professionProgressionWithExperience['experience']).toBe(6400);
    });

    it('should be able to level up', () => {
        const [professionProgression, _] = ProfessionProgression.create<ProfessionProgression>(6300).asArray();
        expect(professionProgression.level).toBe(16);
        const professionProgressionWithExperience = professionProgression.gainExperience(100);
        expect(professionProgressionWithExperience.level).toBe(17);
    });
});