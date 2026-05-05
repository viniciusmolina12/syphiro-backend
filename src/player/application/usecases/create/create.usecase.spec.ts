import { Player, PlayerId } from '@player/domain/player.aggregate';
import { IPlayerRepository } from '@player/domain/repositories/player.repository';
import { IdentityId, InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { InvalidNameError } from '@player/domain/value-objects/name.vo';
import { PlayerAlreadyExistsError } from '@player/domain/errors';
import { CreatePlayerUsecase } from './create.usecase';

class InMemoryPlayerRepository implements IPlayerRepository {
    public players: Player[] = [];

    async findByIdentityId(identityId: IdentityId): Promise<Player | null> {
        return this.players.find(p => p.identity_id.equals(identityId)) ?? null;
    }

    async existsByIdentityId(identityId: IdentityId): Promise<boolean> {
        return this.players.some(p => p.identity_id.equals(identityId));
    }

    async save(player: Player): Promise<void> {
        this.players.push(player);
    }
}

interface Sut {
    usecase: CreatePlayerUsecase;
    playerRepository: InMemoryPlayerRepository;
}

const makeSut = (): Sut => {
    const playerRepository = new InMemoryPlayerRepository();
    const usecase = new CreatePlayerUsecase(playerRepository);
    return { usecase, playerRepository };
};

const validInput = {
    identity_id: 'cognito|abc-123-def-456',
    name: 'Jon Snow',
};

describe('CreatePlayerUsecase', () => {
    describe('sucesso', () => {
        it('deve criar um player com sucesso', async () => {
            const { usecase } = makeSut();

            const [result, error] = (await usecase.execute(validInput)).asArray();

            expect(error).toBeNull();
            expect(result).toBeInstanceOf(Player);
        });

        it('deve retornar um player com os dados corretos', async () => {
            const { usecase } = makeSut();

            const [result] = (await usecase.execute(validInput)).asArray();

            expect(result.identity_id.value).toBe(validInput.identity_id);
            expect(result.name.value).toBe(validInput.name);
            expect(result.id).toBeInstanceOf(PlayerId);
        });

        it('deve persistir o player no repositório', async () => {
            const { usecase, playerRepository } = makeSut();
            const saveSpy = jest.spyOn(playerRepository, 'save');

            const [result] = (await usecase.execute(validInput)).asArray();

            expect(saveSpy).toHaveBeenCalledWith(result);
            expect(playerRepository.players).toHaveLength(1);
        });

        it('deve emitir o evento PlayerCreated', async () => {
            const { usecase } = makeSut();

            const [result] = (await usecase.execute(validInput)).asArray();

            expect(result.domainEvents).toHaveLength(1);
            expect(result.domainEvents[0].eventName).toBe('PlayerCreated');
        });
    });

    describe('erro', () => {
        it('deve falhar se o identityId já estiver registrado', async () => {
            const { usecase, playerRepository } = makeSut();
            await usecase.execute(validInput);

            const [_, error] = (await usecase.execute(validInput)).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyExistsError);
        });

        it('deve falhar se dois players tentarem usar o mesmo identityId', async () => {
            const { usecase } = makeSut();
            await usecase.execute(validInput);

            const [_, error] = (
                await usecase.execute({ identity_id: validInput.identity_id, name: 'Different Name' })
            ).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyExistsError);
        });

        it('deve falhar se o identityId for vazio', async () => {
            const { usecase } = makeSut();

            const [_, error] = (
                await usecase.execute({ identity_id: '', name: 'Jon Snow' })
            ).asArray();

            expect(error).toBeInstanceOf(InvalidIdentityIdError);
        });

        it('deve falhar se o nome for muito curto', async () => {
            const { usecase } = makeSut();

            const [_, error] = (
                await usecase.execute({ identity_id: validInput.identity_id, name: 'Jo' })
            ).asArray();

            expect(error).toBeInstanceOf(InvalidNameError);
        });

        it('deve falhar se o nome for muito longo', async () => {
            const { usecase } = makeSut();

            const [_, error] = (
                await usecase.execute({ identity_id: validInput.identity_id, name: 'a'.repeat(256) })
            ).asArray();

            expect(error).toBeInstanceOf(InvalidNameError);
        });
    });
});
