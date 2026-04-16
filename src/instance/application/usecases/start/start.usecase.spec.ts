import { PlayerId } from '../../../../player/domain/player.aggregate';
import { INSTANCE_RULES, Instance, InstanceDifficulty, InstanceId, InstanceStatus } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceNotFoundError } from '../../../domain/errors/instance-not-found.error';
import { InstanceNotPendingError } from '../../../domain/errors/instance-not-pending.error';
import { InsufficientPlayersError } from '../../../domain/errors/insufficient-players.error';
import { NotInstanceCreatorError } from '../../../domain/errors/not-instance-creator.error';
import { InstanceExistsByIdValidation } from '../../validations/instance_exists_by_id.validation';
import { StartInstanceUsecase } from './start.usecase';

class InMemoryInstanceRepository implements IInstanceRepository {
    public instances: Instance[] = [];

    async findById(id: InstanceId): Promise<Instance | null> {
        return this.instances.find(i => i.id.equals(id)) ?? null;
    }

    async existsById(id: InstanceId): Promise<boolean> {
        return this.instances.some(i => i.id.equals(id));
    }

    async findActiveByPlayerId(player_id: PlayerId): Promise<Instance | null> {
        return this.instances.find(i => i.participants.some(p => p.equals(player_id)) && i.isActive()) ?? null;
    }

    async save(instance: Instance): Promise<void> {
        this.instances.push(instance);
    }

    async update(instance: Instance): Promise<void> {
        const index = this.instances.findIndex(i => i.id.equals(instance.id));
        if (index !== -1) this.instances[index] = instance;
    }
}

interface Sut {
    usecase: StartInstanceUsecase;
    instanceRepository: InMemoryInstanceRepository;
}

const makeSut = (): Sut => {
    const instanceRepository = new InMemoryInstanceRepository();
    const instanceExistsByIdValidation = new InstanceExistsByIdValidation(instanceRepository);
    const usecase = new StartInstanceUsecase(instanceRepository, instanceExistsByIdValidation);
    return { usecase, instanceRepository };
};

const makeInstanceWithPlayers = (extraPlayers = INSTANCE_RULES.MIN_PLAYERS.value - 1): { instance: Instance; creator_id: PlayerId } => {
    const creator_id = new PlayerId();
    const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
    for (let i = 0; i < extraPlayers; i++) {
        instance.addParticipant(new PlayerId());
    }
    return { instance, creator_id };
};

describe('StartInstanceUsecase', () => {
    describe('sucesso', () => {
        it('deve iniciar a instância quando o criador solicita e há jogadores suficientes', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers();
            instanceRepository.instances.push(instance);

            const [result, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeNull();
            expect(result).toBeDefined();
        });

        it('deve transitar o status para RUNNING', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers();
            instanceRepository.instances.push(instance);

            await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() });

            expect(instance.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve retornar a instância atualizada', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers();
            instanceRepository.instances.push(instance);

            const [result] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(result.id.equals(instance.id)).toBe(true);
            expect(result.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve persistir a instância atualizada no repositório', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers();
            instanceRepository.instances.push(instance);
            const updateSpy = jest.spyOn(instanceRepository, 'update');

            await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() });

            expect(updateSpy).toHaveBeenCalledWith(instance);
        });

        it('deve permitir iniciar com exatamente o número mínimo de jogadores', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers(INSTANCE_RULES.MIN_PLAYERS.value - 1);
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeNull();
            expect(instance.participants.length).toBe(INSTANCE_RULES.MIN_PLAYERS.value);
        });

        it('deve permitir iniciar com o número máximo de jogadores', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers(INSTANCE_RULES.MAX_PLAYERS.value - 1);
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeNull();
        });
    });

    describe('erro', () => {
        it('deve falhar se a instância não existir', async () => {
            const { usecase } = makeSut();

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: new InstanceId().toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotFoundError);
        });

        it('deve falhar se o solicitante não for o criador da instância', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance } = makeInstanceWithPlayers();
            instanceRepository.instances.push(instance);

            const non_creator = new PlayerId();

            const [_, error] = (
                await usecase.execute({ player_id: non_creator, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(NotInstanceCreatorError);
        });

        it('deve falhar se um participante não-criador tentar iniciar', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance } = makeInstanceWithPlayers();
            const participant_id = new PlayerId();
            instance.addParticipant(participant_id);
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: participant_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(NotInstanceCreatorError);
        });

        it('deve falhar se a instância não estiver PENDING', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers();
            instance.start();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver ABANDONED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const creator_id = new PlayerId();
            const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
            instance.abandon();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se não houver jogadores suficientes para iniciar', async () => {
            const { usecase, instanceRepository } = makeSut();
            const creator_id = new PlayerId();
            const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InsufficientPlayersError);
        });

        it('deve falhar com mínimo - 1 jogadores', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeInstanceWithPlayers(INSTANCE_RULES.MIN_PLAYERS.value - 2);
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InsufficientPlayersError);
        });
    });
});
