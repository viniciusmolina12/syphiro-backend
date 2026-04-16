import { Either } from "../../../@shared/either";
import { Character } from "../../../character/domain/character.aggregate";
import { ICharacterRepository } from "../../../character/domain/repositories/character.repository";
import { Enemy } from "../../../enemy/domain/enemy.aggregate";
import { IEnemyRepository } from "../../../enemy/domain/repositories/enemy.repository";
import { SkillId } from "../../../skill/domain/skill.entity";
import { ISkillRepository } from "../../../skill/domain/repositories/skill.repository";
import { Combat, CombatId } from "../../domain/combat.aggregate";
import { CombatantNotFoundError, CombatNotFoundError, NotCombatantTurnError, SkillNotFoundError, SkillNotOwnedError } from "../../domain/combat.errors";
import { Combatant, CombatantId } from "../../domain/entities/combatant.entity";
import { ICombatRepository } from "../../domain/repositories/combat.repository";
import { CalculateCharacterDamageService } from "../../domain/services/calculate-character-damage.service";

type ApplyMoveError =
    | CombatNotFoundError
    | CombatantNotFoundError
    | SkillNotFoundError
    | SkillNotOwnedError
    | NotCombatantTurnError;

export interface ApplyMoveCommand {
    combat_id: CombatId;
    skill_id: SkillId;
    combatant_id: CombatantId;
    target_combatant_id: CombatantId;
}
export interface ApplyMoveResult {
   combat: Combat;
}
export class ApplyMoveUsecase {
    constructor(
        private readonly combatRepository: ICombatRepository,
        private readonly characterRepository: ICharacterRepository,
        private readonly enemyRepository: IEnemyRepository,
        private readonly skillRepository: ISkillRepository,
        private readonly calculateCharacterDamageService: CalculateCharacterDamageService,
    ) {}

    async execute(command: ApplyMoveCommand): Promise<Either<ApplyMoveResult, ApplyMoveError>> {
        const { combat_id, skill_id, combatant_id, target_combatant_id } = command;

        const combat = await this.combatRepository.findById(combat_id);
        if (!combat) return Either.fail(new CombatNotFoundError());

        const combatant = combat.combatants.find(c => c.id.equals(combatant_id));
        if (!combatant) return Either.fail(new CombatantNotFoundError(combatant_id.toString()));

        const target_combatant = combat.combatants.find(c => c.id.equals(target_combatant_id));
        if (!target_combatant) return Either.fail(new CombatantNotFoundError(target_combatant_id.toString()));

        const combat_result = combat.act(combatant_id, target_combatant_id);
        if (combat_result.isFail()) return Either.fail(combat_result.error);

        const skill = await this.skillRepository.findById(skill_id);
        if (!skill) return Either.fail(new SkillNotFoundError());

        const source = await this.getCombatantEntity(combatant);
        if (!source) return Either.fail(new CombatantNotFoundError(combatant.reference_id.toString()));

        const target = await this.getCombatantEntity(target_combatant);
        if (!target) return Either.fail(new CombatantNotFoundError(target_combatant.reference_id.toString()));

        if (!source.hasSkill(skill_id)) return Either.fail(new SkillNotOwnedError());

        if (source instanceof Character) {
            const damage = this.calculateCharacterDamageService.execute({ character: source, target, skill });
            target.applyDamage(damage);
            if (target.isDead()) combat.disableCombatant(target_combatant_id);
            await this.enemyRepository.update(target as Enemy);
        } else {
            const damage = source.skills.find(s => s.id.equals(skill_id))!.base_damage;
            target.applyDamage(damage);
            if (target.isDead()) combat.disableCombatant(target_combatant_id);
            await this.characterRepository.update(target as Character);
        }
        
        combat.tryMarkCombatOver();
        await this.combatRepository.update(combat);
        return Either.ok({ combat });
    }

    private async getCombatantEntity(combatant: Combatant) {
        return combatant.isCharacter()
            ? this.characterRepository.findById(combatant.reference_id)
            : this.enemyRepository.findById(combatant.reference_id);
    }
}
