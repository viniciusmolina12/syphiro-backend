import { Character, CharacterId } from "../../../../../character/domain/character.aggregate";
import { ICharacterRepository } from "../../../../../character/domain/repositories/character.repository";
import { ClassSkill, ClassSkillId } from "../../../../../class/domain/class_skill";
import { IClassSkillRepository } from "../../../../../class/domain/repositories/class-skill.repository";
import { Enemy, EnemyId } from "../../../../../enemy/domain/enemy.aggregate";
import { IEnemyRepository } from "../../../../../enemy/domain/repositories/enemy.repository";
import { InstanceId } from "../../../../../instance/domain/instance.aggregate";
import { Combat, CombatId } from "../../../../domain/combat.aggregate";
import { Turn } from "../../../../domain/entities/turn.entity";
import { ICombatRepository } from "../../../../domain/repositories/combat.repository";

export class InMemoryCombatRepository implements ICombatRepository {
    private combats: Combat[] = [];

    async findById(id: CombatId): Promise<Combat | null> {
        return this.combats.find(c => c.id.equals(id)) ?? null;
    }
    async save(combat: Combat): Promise<void> {
        this.combats.push(combat);
    }
}


export class InMemoryCharacterRepository implements ICharacterRepository {
    private characters: Character[] = [];

    async findById(id: CharacterId): Promise<Character | null> {
        return this.characters.find(c => c.id.equals(id)) ?? null;
    }
    async create(character: Character): Promise<void> {
        this.characters.push(character);
    }
}

export class InMemoryEnemyRepository implements IEnemyRepository {
    private enemies: Enemy[] = [];

    async findById(id: EnemyId): Promise<Enemy | null> {
        return this.enemies.find(e => e.id.equals(id)) ?? null;
    }
    async save(enemy: Enemy): Promise<void> {
        this.enemies.push(enemy);
    }
}


export class InMemoryClassSkillRepository implements IClassSkillRepository {
    private classSkills: ClassSkill[] = [];

    async findById(id: ClassSkillId): Promise<ClassSkill | null> {
        return this.classSkills.find(s => s.id.equals(id)) ?? null;
    }

    async save(skill: ClassSkill): Promise<void> {
        this.classSkills.push(skill);
    }
}