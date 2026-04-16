import { Character } from "../../../character/domain/character.aggregate";
import { Enemy } from "../../../enemy/domain/enemy.aggregate";
import { Skill } from "../../../skill/domain/skill.entity";

export interface CalculateCharacterDamageCommand {
    character: Character;
    target: Character | Enemy;
    skill: Skill;
}

export class CalculateCharacterDamageService {
    execute(command: CalculateCharacterDamageCommand): number {
        return command.skill.base_damage;
    }
}
