import { Either } from "@shared/either";
import { CharactersExistsByIdsValidation } from "@character/application/validations/characters_exists_by_ids.validation";
import { CharacterId } from "@character/domain/character.aggregate";
import { CharacterNotFoundError } from "@character/domain/errors/character-not-found.error";
import { InstanceId } from "@instance/domain/instance.aggregate";
import { Combat } from "@combat/domain/combat.aggregate";
import { Combatant } from "@combat/domain/entities/combatant.entity";
import { ICombatRepository } from "@combat/domain/repositories/combat.repository";
import { IInstanceRepository } from "@instance/domain/repositories/instance.repository";
import { InstanceNotFoundError } from "@instance/domain/errors";
import { ICampaignChapterFloorRepository } from "@campaign/domain/repositories/campaign-chapter-floor.repository";

interface CreateCombatInput {
    combatants_characters_ids: string[];
    instance_id: string;
}

export class CreateCombatUsecase {
    constructor(
        private readonly combatRepository: ICombatRepository,
        private readonly instanceRepository: IInstanceRepository,
        private readonly campaignChapterFloorRepository: ICampaignChapterFloorRepository,
        private readonly charactersExistsByIdsValidation: CharactersExistsByIdsValidation,
    ) {}

    async execute(command: CreateCombatInput): Promise<Either<Combat, Error>> {
        const instance_id = new InstanceId(command.instance_id);
        const instance = await this.instanceRepository.findById(instance_id);
        if (!instance) return Either.fail(new InstanceNotFoundError());

        const characters_ids = command.combatants_characters_ids.map(id => new CharacterId(id));
        const characters_exist = await this.charactersExistsByIdsValidation.validate(characters_ids, instance_id);
        if (!characters_exist) return Either.fail(new CharacterNotFoundError());

        const campaign_chapter_floor = await this.campaignChapterFloorRepository.findById(instance.campaign_chapter_floor_id);
        const character_combatants = characters_ids.map(id => Combatant.createPlayer(id));
        const enemy_combatant = Combatant.createEnemy(campaign_chapter_floor!.enemy_id);

        const [combat, error] = Combat.create({ combatants: [...character_combatants, enemy_combatant], instance_id }).asArray();
        if (error) return Either.fail(error);

        await this.combatRepository.save(combat);
        return Either.ok(combat);
    }
}
