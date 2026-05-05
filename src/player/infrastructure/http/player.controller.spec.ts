import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { CreatePlayerUsecase } from '@player/application/usecases/create/create.usecase';
import { Player } from '@player/domain/player.aggregate';
import { Either } from '@shared/either';
import { InvalidNameError } from '@player/domain/value-objects/name.vo';
import { InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { PlayerAlreadyExistsError } from '@player/domain/errors';
import { identity } from 'rxjs';

const VALID_IDENTITY_ID = 'cognito|abc-123';
const VALID_NAME = 'Arthur';

const makePlayer = () =>
    Player.create({ identity_id: VALID_IDENTITY_ID, name: VALID_NAME }).asArray()[0] as Player;

describe('PlayerController', () => {
    let controller: PlayerController;
    let createPlayerUsecase: jest.Mocked<Pick<CreatePlayerUsecase, 'execute'>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PlayerController],
            providers: [
                { provide: CreatePlayerUsecase, useValue: { execute: jest.fn() } },
            ],
        }).compile();

        controller = module.get(PlayerController);
        createPlayerUsecase = module.get(CreatePlayerUsecase);
    });

    describe('POST /players', () => {
        it('deve retornar o player criado', async () => {
            const player = makePlayer();
            createPlayerUsecase.execute.mockResolvedValue(Either.ok(player));

            const result = await controller.create({ identity_id: VALID_IDENTITY_ID, name: VALID_NAME });

            expect(result).toEqual({
                id: player.id.toString(),
                name: player.name.value,
                identity_id: player.identity_id.value
            });
        });

        it('deve lançar BadRequestException para identity ID inválido', async () => {
            createPlayerUsecase.execute.mockResolvedValue(Either.fail(new InvalidIdentityIdError()));

            await expect(
                controller.create({ identity_id: '', name: VALID_NAME }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('deve lançar BadRequestException para nome inválido', async () => {
            createPlayerUsecase.execute.mockResolvedValue(Either.fail(new InvalidNameError('too short')));

            await expect(
                controller.create({ identity_id: VALID_IDENTITY_ID, name: 'ab' }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('deve lançar ConflictException quando player já existe', async () => {
            createPlayerUsecase.execute.mockResolvedValue(Either.fail(new PlayerAlreadyExistsError()));

            await expect(
                controller.create({ identity_id: VALID_IDENTITY_ID, name: VALID_NAME }),
            ).rejects.toBeInstanceOf(ConflictException);
        });
    });
});
