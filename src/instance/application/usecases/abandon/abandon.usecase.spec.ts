import { PlayerId } from '../../../../player/domain/player.aggregate';
import { INSTANCE_RULES, Instance, InstanceDifficulty, InstanceId, InstanceStatus } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { InstanceNotFoundError } from '../../../domain/errors/instance-not-found.error';
import { InstanceNotPendingError } from '../../../domain/errors/instance-not-pending.error';
import { NotInstanceCreatorError } from '../../../domain/errors/not-instance-creator.error';
import { InstanceExistsByIdValidation } from '../../validations/instance_exists_by_id.validation';
import { AbandonInstanceUsecase } from './abandon.usecase';

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
    usecase: AbandonInstanceUsecase;
    instanceRepository: InMemoryInstanceRepository;
}

const makeSut = (): Sut => {
    const instanceRepository = new InMemoryInstanceRepository();
    const instanceExistsByIdValidation = new InstanceExistsByIdValidation(instanceRepository);
    const usecase = new AbandonInstanceUsecase(instanceRepository, instanceExistsByIdValidation);
    return { usecase, instanceRepository };
};

const makePendingInstance = (): { instance: Instance; creator_id: PlayerId } => {
    const creator_id = new PlayerId();
    const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
    return { instance, creator_id };
};

const makeRunningInstance = (): { instance: Instance; creator_id: PlayerId } => {
    const creator_id = new PlayerId();
    const instance = Instance.create({ player_id: creator_id, difficulty: InstanceDifficulty.NORMAL });
    for (let i = 1; i < INSTANCE_RULES.MIN_PLAYERS.value; i++) {
        instance.addParticipant(new PlayerId());
    }
    instance.start();
    return { instance, creator_id };
};

describe('AbandonInstanceUsecase', () => {
    describe('sucesso', () => {
        it('deve abandonar a instância quando o criador solicita', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makePendingInstance();
            instanceRepository.instances.push(instance);

            const [result, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeNull();
            expect(result).toBeDefined();
        });

        it('deve transitar o status para ABANDONED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makePendingInstance();
            instanceRepository.instances.push(instance);

            await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() });

            expect(instance.status).toBe(InstanceStatus.ABANDONED);
        });

        it('deve retornar a instância atualizada', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makePendingInstance();
            instanceRepository.instances.push(instance);

            const [result] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(result.id.equals(instance.id)).toBe(true);
            expect(result.status).toBe(InstanceStatus.ABANDONED);
        });

        it('deve persistir a instância atualizada no repositório', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makePendingInstance();
            instanceRepository.instances.push(instance);
            const updateSpy = jest.spyOn(instanceRepository, 'update');

            await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() });

            expect(updateSpy).toHaveBeenCalledWith(instance);
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

        it('deve falhar se o solicitante não for o criador', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance } = makePendingInstance();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: new PlayerId(), instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(NotInstanceCreatorError);
        });

        it('deve falhar se um participante não-criador tentar abandonar', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance } = makePendingInstance();
            const participant_id = new PlayerId();
            instance.addParticipant(participant_id);
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: participant_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(NotInstanceCreatorError);
        });

        it('deve falhar se a instância estiver RUNNING', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeRunningInstance();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância já estiver ABANDONED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makePendingInstance();
            instance.abandon();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver COMPLETED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeRunningInstance();
            instance.complete();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância estiver FAILED', async () => {
            const { usecase, instanceRepository } = makeSut();
            const { instance, creator_id } = makeRunningInstance();
            instance.fail();
            instanceRepository.instances.push(instance);

            const [_, error] = (
                await usecase.execute({ player_id: creator_id, instance_id: instance.id.toString() })
            ).asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });
    });
});
