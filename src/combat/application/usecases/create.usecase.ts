import { Either } from "@shared/either";
import { CharactersExistsByIdsValidation } from "@character/application/validations/characters_exists_by_ids.validation";
import { CharacterId } from "@character/domain/character.aggregate";
import { CharacterNotFoundError } from "@character/domain/errors/character-not-found.error";
import { EnemiesExistsByIdsValidation } from "@enemy/application/validations/enemy-exists-by-ids.validation";
import { EnemyId } from "@enemy/domain/enemy.aggregate";
import { EnemyNotFoundError } from "@enemy/domain/errors/enemy-not-found.error";
import { InstanceId } from "@instance/domain/instance.aggregate";
import { Combat } from "@combat/domain/combat.aggregate";
import { Combatant } from "@combat/domain/entities/combatant.entity";
import { ICombatRepository } from "@combat/domain/repositories/combat.repository";

interface CreateCombatUsecaseInput {
    combatants_characters_ids: string[];
    combatants_enemies_ids: string[];
    instance_id: string;
}

export class CreateCombatUsecase {
    constructor(
        private readonly combatRepository: ICombatRepository,
        private readonly charactersExistsByIdsValidation: CharactersExistsByIdsValidation,
        private readonly enemiesExistsByIdsValidation: EnemiesExistsByIdsValidation,
    ) {}

    async execute(command: CreateCombatUsecaseInput): Promise<Either<Combat, Error>> {
        const characters_ids = command.combatants_characters_ids.map(id => new CharacterId(id));
        const instance_id = new InstanceId(command.instance_id);
        const characters_exists = await this.charactersExistsByIdsValidation.validate(characters_ids, instance_id);
        if (!characters_exists) return Either.fail(new CharacterNotFoundError());


        const enemies_ids = command.combatants_enemies_ids.map(id => new EnemyId(id));
        const enemies_exists = await this.enemiesExistsByIdsValidation.validate(enemies_ids);
        if (!enemies_exists) return Either.fail(new EnemyNotFoundError());
        

        const combatants = [
            ...characters_ids.map(id => Combatant.createPlayer(id)),
            ...enemies_ids.map(id => Combatant.createEnemy(id))
        ];
        const [combat, error] = Combat.create({ combatants: combatants, instance_id: instance_id }).asArray();
        if (error) return Either.fail(error);
        await this.combatRepository.save(combat);
        return Either.ok(combat);
    }
}