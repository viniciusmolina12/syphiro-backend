import { Character, CharacterId } from "@character/domain/character.aggregate";
import { ICharacterRepository } from "@character/domain/repositories/character.repository";
import { ClassSkill, ClassSkillId } from "@class/domain/class_skill";
import { IClassSkillRepository } from "@class/domain/repositories/class-skill.repository";
import { Enemy, EnemyId } from "@enemy/domain/enemy.aggregate";
import { IEnemyRepository } from "@enemy/domain/repositories/enemy.repository";
import { Instance, InstanceId } from "@instance/domain/instance.aggregate";
import { IInstanceRepository } from "@instance/domain/repositories/instance.repository";
import { PlayerId } from "@player/domain/player.aggregate";
import { CampaignChapterFloor, CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";
import { ICampaignChapterFloorRepository } from "@campaign/domain/repositories/campaign-chapter-floor.repository";
import { Combat, CombatId } from "@combat/domain/combat.aggregate";
import { ICombatRepository } from "@combat/domain/repositories/combat.repository";

export class InMemoryCombatRepository implements ICombatRepository {
    private combats: Combat[] = [];

    async findById(id: CombatId): Promise<Combat | null> {
        return this.combats.find(c => c.id.equals(id)) ?? null;
    }
    async save(combat: Combat): Promise<void> {
        this.combats.push(combat);
    }
    async findByEnemyId(enemy_id: EnemyId): Promise<Combat | null> {
        return this.combats.find(c => c.combatants.some(c => c.id.equals(enemy_id))) ?? null;
    }

    async update(combat: Combat): Promise<void> {
        const index = this.combats.findIndex(current_combat => current_combat.id.equals(combat.id));
        if (index !== -1) {
            this.combats[index] = combat;
        }
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
    async save(character: Character): Promise<void> {
        this.characters.push(character);
    }

    async update(character: Character): Promise<void> {
        const index = this.characters.findIndex(current_character => current_character.id.equals(character.id));
        if (index !== -1) {
            this.characters[index] = character;
        }
    }
    async existsByIds(ids: CharacterId[], instance_id: InstanceId): Promise<boolean> {
        return this.characters.some(c => ids.some(id => c.id.equals(id)) && c.instance_id.equals(instance_id));
    }
}

export class InMemoryEnemyRepository implements IEnemyRepository {
    private enemies: Enemy[] = [];

    async findById(id: EnemyId): Promise<Enemy | null> {
        return this.enemies.find(e => e.id.equals(id)) ?? null;
    }

    async existsByIds(ids: EnemyId[]): Promise<boolean> {
        return this.enemies.some(e => ids.some(id => e.id.equals(id)));
    }

    async save(enemy: Enemy): Promise<void> {
        this.enemies.push(enemy);
    }
    async update(enemy: Enemy): Promise<void> {
        const index = this.enemies.findIndex(current_enemy => current_enemy.id.equals(enemy.id));
        if (index !== -1) {
            this.enemies[index] = enemy;
        }
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

export class InMemoryInstanceRepository implements IInstanceRepository {
    public instances: Instance[] = [];

    async findById(id: InstanceId): Promise<Instance | null> {
        return this.instances.find(i => i.id.equals(id)) ?? null;
    }
    async existsById(id: InstanceId): Promise<boolean> {
        return this.instances.some(i => i.id.equals(id));
    }
    async findActiveByPlayerId(player_id: PlayerId): Promise<Instance | null> {
        return this.instances.find(i => i.player_id.equals(player_id)) ?? null;
    }
    async save(instance: Instance): Promise<void> {
        this.instances.push(instance);
    }
    async update(instance: Instance): Promise<void> {
        const index = this.instances.findIndex(i => i.id.equals(instance.id));
        if (index !== -1) this.instances[index] = instance;
    }
}

export class InMemoryCampaignChapterFloorRepository implements ICampaignChapterFloorRepository {
    private floors: CampaignChapterFloor[] = [];

    async findById(id: CampaignChapterFloorId): Promise<CampaignChapterFloor | null> {
        return this.floors.find(f => f.id.equals(id)) ?? null;
    }

    save(floor: CampaignChapterFloor): void {
        this.floors.push(floor);
    }
}