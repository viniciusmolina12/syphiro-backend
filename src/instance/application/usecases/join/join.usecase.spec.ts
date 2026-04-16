import { PlayerId } from '../../../../player/domain/player.aggregate';
import { Instance, INSTANCE_RULES, InstanceDifficulty, InstanceId, InstanceStatus } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceFullError } from '../../../domain/errors/instance-full.error';
import { InstanceNotFoundError } from '../../../domain/errors/instance-not-found.error';
import { InstanceNotPendingError } from '../../../domain/errors/instance-not-pending.error';
import { PlayerAlreadyInInstanceError } from '../../../domain/errors/player-already-in-instance.error';
import { JoinInstanceUsecase } from './join.usecase';

class InMemoryInstanceRepository implements IInstanceRepository {
    public instances: Instance[] = [];

    async findById(id: InstanceId): Promise<Instance | null> {
        return this.instances.find(i => i.id.equals(id)) ?? null;
    }

    async existsById(id: InstanceId): Promise<boolean> {
        return this.instances.some(i => i.id.equals(id));
    }

    async findActiveByPlayerId(player_id: PlayerId): Promise<Instance | null> {
        return (
            this.instances.find(
                i => i.participants.some(p => p.equals(player_id)) && i.isActive(),
            ) ?? null
        );
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
    usecase: JoinInstanceUsecase;
    instanceRepository: InMemoryInstanceRepository;
}

const makeSut = (): Sut => {
    const instanceRepository = new InMemoryInstanceRepository();
    const usecase = new JoinInstanceUsecase(instanceRepository);
    return { usecase, instanceRepository };
};

const makePendingInstance = (): Instance =>
    Instance.create({ player_id: new PlayerId(), difficulty: InstanceDifficulty.NORMAL });

const makeRunningInstance = (): Instance => {
    const instance = Instance.create({ player_id: new PlayerId(), difficulty: InstanceDifficulty.NORMAL });
    for (let i = 1; i < INSTANCE_RULES.MIN_PLAYERS.value; i++) {
        instance.addParticipant(new PlayerId());
    }
    instance.start();
    return instance;
};

describe('JoinInstanceUsecase', () => {
    describe('sucesso', () => {
        it('deve permitir que um jogador entre em uma instância pendente', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instanceRepository.instances.push(instance);

            const [result, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeNull();
            expect(result).toBeDefined();
        });

        it('deve adicionar o jogador à lista de participantes da instância', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instanceRepository.instances.push(instance);
            const player_id = new PlayerId();

            await usecase.execute({ player_id, instance_id: instance.id.toString() });

            expect(instance.participants.some(p => p.equals(player_id))).toBe(true);
        });

        it('deve retornar a instância atualizada', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instanceRepository.instances.push(instance);
            const player_id = new PlayerId();

            const [result] = (
                await usecase.execute({ player_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(result.id.equals(instance.id)).toBe(true);
        });

        it('deve persistir a instância atualizada no repositório', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instanceRepository.instances.push(instance);
            const updateSpy = jest.spyOn(instanceRepository, 'update');

            await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() });

            expect(updateSpy).toHaveBeenCalledWith(instance);
        });

        it('deve permitir que múltiplos jogadores entrem na mesma instância até o limite', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instanceRepository.instances.push(instance);

            for (let i = 1; i < INSTANCE_RULES.MAX_PLAYERS.value; i++) {
                const [_, error] = (
                    await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
                ).asArray();
                expect(error).toBeNull();
            }

            expect(instance.participants.length).toBe(INSTANCE_RULES.MAX_PLAYERS.value);
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

        it('deve falhar se a instância não estiver com status PENDING', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makeRunningInstance();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver com status COMPLETED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makeRunningInstance();
            instance.complete();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver com status ABANDONED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            instance.abandon();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver lotada (8 jogadores)', async () => {
            const { usecase, instanceRepository } = makeSut();
            const instance = makePendingInstance();
            for (let i = 1; i < INSTANCE_RULES.MAX_PLAYERS.value; i++) {
                instance.addParticipant(new PlayerId());
            }
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceFullError);
        });

        it('deve falhar se o jogador já for participante desta instância', async () => {
            const { usecase, instanceRepository } = makeSut();
            const creator_id = new PlayerId();
            const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyInInstanceError);
        });

        it('deve falhar se o jogador já estiver em outra instância pendente', async () => {
            const { usecase, instanceRepository } = makeSut();
            const player_id = new PlayerId();

            const other_instance = makePendingInstance();
            other_instance.addParticipant(player_id);
            instanceRepository.instances.push(other_instance);

            const target_instance = makePendingInstance();
            instanceRepository.instances.push(target_instance);

            const [_, error] = (
                await usecase.execute({ player_id, instance_id: target_instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyInInstanceError);
        });

        it('deve falhar se o jogador já estiver em uma instância em andamento', async () => {
            const { usecase, instanceRepository } = makeSut();
            const player_id = new PlayerId();

            const running_instance = Instance.create({ player_id: new PlayerId(), difficulty: InstanceDifficulty.NORMAL });
            for (let i = 1; i < INSTANCE_RULES.MIN_PLAYERS.value; i++) {
                running_instance.addParticipant(new PlayerId());
            }
            running_instance.addParticipant(player_id);
            running_instance.start();
            instanceRepository.instances.push(running_instance);

            const target_instance = makePendingInstance();
            instanceRepository.instances.push(target_instance);

            const [_, error] = (
                await usecase.execute({ player_id, instance_id: target_instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyInInstanceError);
        });
    });
});
