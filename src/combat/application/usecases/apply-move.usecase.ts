import { Either } from "../../../@shared/either";
import { Character } from "../../../character/domain/character.aggregate";
import { ICharacterRepository } from "../../../character/domain/repositories/character.repository";
import { ClassSkillId } from "../../../class/domain/class_skill";
import { IClassSkillRepository } from "../../../class/domain/repositories/class-skill.repository";
import { Enemy } from "../../../enemy/domain/enemy.aggregate";
import { IEnemyRepository } from "../../../enemy/domain/repositories/enemy.repository";
import { CombatId } from "../../domain/combat.aggregate";
import { CombatantNotFoundError, CombatNotFoundError, NotCombatantTurnError, SkillNotFoundError, SkillNotOwnedError } from "../../domain/combat.errors";
import { CombatantId } from "../../domain/entities/combatant.entity";
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
    skill_id: ClassSkillId;
    combatant_id: CombatantId;
    target_combatant_id: CombatantId;
}

export class ApplyMoveUsecase {
    constructor(
        private readonly combatRepository: ICombatRepository,
        private readonly characterRepository: ICharacterRepository,
        private readonly enemyRepository: IEnemyRepository,
        private readonly classSkillRepository: IClassSkillRepository,
        private readonly calculateCharacterDamageService: CalculateCharacterDamageService,
    ) {}

    async execute(command: ApplyMoveCommand): Promise<Either<void, ApplyMoveError>> {
        const { combat_id, skill_id, combatant_id, target_combatant_id } = command;

        const combat = await this.combatRepository.findById(combat_id);
        if (!combat) return Either.fail(new CombatNotFoundError());

        const combatant = combat.combatants.find(c => c.id.equals(combatant_id));
        if (!combatant) return Either.fail(new CombatantNotFoundError(combatant_id.toString()));

        const target_combatant = combat.combatants.find(c => c.id.equals(target_combatant_id));
        if (!target_combatant) return Either.fail(new CombatantNotFoundError(target_combatant_id.toString()));

        const skill = await this.classSkillRepository.findById(skill_id);
        if (!skill) return Either.fail(new SkillNotFoundError());

        const source = combatant.isPlayer()
            ? await this.characterRepository.findById(combatant.reference_id)
            : await this.enemyRepository.findById(combatant.reference_id);
        if (!source) return Either.fail(new CombatantNotFoundError(combatant.reference_id.toString()));

        const target = target_combatant.isPlayer()
            ? await this.characterRepository.findById(target_combatant.reference_id)
            : await this.enemyRepository.findById(target_combatant.reference_id);
        if (!target) return Either.fail(new CombatantNotFoundError(target_combatant.reference_id.toString()));

        const combat_result = combat.act(combatant_id, target_combatant_id);
        if (combat_result.isFail()) return Either.fail(combat_result.error);

        if (source instanceof Character) {
            const characterHasSkill = source.class.skills.some(s => s.id.equals(skill_id));
            if (!characterHasSkill) return Either.fail(new SkillNotOwnedError());

            const damage = this.calculateCharacterDamageService.execute({ character: source, target, skill });
            target.applyDamage(damage);
            await this.enemyRepository.save(target as Enemy);
        } else {
            // TODO - Implementar enemy damage
        }

        await this.combatRepository.save(combat);
        return Either.ok(undefined);
    }
}