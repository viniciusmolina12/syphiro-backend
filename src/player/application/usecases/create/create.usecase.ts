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
        const [identity_id, identity_id_error] = IdentityId.create(input.identity_id).asArray();
        if (identity_id_error) return Either.fail(identity_id_error);

        const player_already_exists = await this.playerRepository.existsByIdentityId(identity_id);
        if (player_already_exists) return Either.fail(new PlayerAlreadyExistsError());

        const [player, player_error] = Player.create(input).asArray();
        if (player_error) return Either.fail(player_error);

        await this.playerRepository.save(player);
        return Either.ok(player);
    }
}
