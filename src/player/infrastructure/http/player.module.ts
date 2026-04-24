import { Module } from '@nestjs/common';
import { PlayerSequelizeRepository } from '@player/infrastructure/database/sequelize/repositories/player-sequelize.repository';
import { CreatePlayerUsecase } from '@player/application/usecases/create/create.usecase';
import { IPlayerRepository } from '@player/domain/repositories/player.repository';
import { PlayerController } from './player.controller';

const PLAYER_REPOSITORY_TOKEN = 'IPlayerRepository';

@Module({
    providers: [
        {
            provide: PLAYER_REPOSITORY_TOKEN,
            useClass: PlayerSequelizeRepository,
        },
        {
            provide: CreatePlayerUsecase,
            useFactory: (repo: IPlayerRepository) => new CreatePlayerUsecase(repo),
            inject: [PLAYER_REPOSITORY_TOKEN],
        },
    ],
    controllers: [PlayerController],
})
export class PlayerModule {}
