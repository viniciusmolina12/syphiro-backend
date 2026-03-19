import { Character } from "../../../character/domain/character.aggregate";
import { ClassSkill } from "../../../class/domain/class_skill";
import { Enemy } from "../../../enemy/domain/enemy.aggregate";

export interface CalculateCharacterDamageCommand {
    character: Character;
    target: Character | Enemy;
    skill: ClassSkill;
}

export class CalculateCharacterDamageService {
    execute(command: CalculateCharacterDamageCommand): number {
        return command.skill.base_damage;
    }
}
