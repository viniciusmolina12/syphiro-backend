import { Either } from '@shared/either';
import { Player, CreatePlayerCommand } from '@player/domain/player.aggregate';
import { IPlayerRepository } from '@player/domain/repositories/player.repository';
import { IdentityId, InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { InvalidNameError } from '@player/domain/value-objects/name.vo';
import { PlayerAlreadyExistsError } from '@player/domain/errors';

type CreatePlayerError = PlayerAlreadyExistsError | InvalidIdentityIdError | InvalidNameError;

export class CreatePlayerUsecase {
    constructor(private readonly playerRepository: IPlayerRepository) {}

    async execute(
        input: CreatePlayerCommand,
    ): Promise<Either<Player, CreatePlayerError>> {
        const [identityId, identityIdError] = IdentityId.create(input.identityId).asArray();
        if (identityIdError) return Either.fail(identityIdError);

        const alreadyExists = await this.playerRepository.existsByIdentityId(identityId);
        if (alreadyExists) return Either.fail(new PlayerAlreadyExistsError());

        const [player, playerError] = Player.create(input).asArray();
        if (playerError) return Either.fail(playerError);

        await this.playerRepository.save(player);
        return Either.ok(player);
    }
}
