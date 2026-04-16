import { PlayerId } from '../../../../player/domain/player.aggregate';
import { Instance, InstanceDifficulty, InstanceId, InstanceStatus } from '../../../domain/instance.aggregate';
import { IInstanceRepository } from '../../../domain/repositories/instance.repository';
import { PlayerAlreadyHasActiveInstanceError } from '../../../domain/errors';
import { CreateInstanceUsecase } from './create.usecase';

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

    async update(instance: Instance): Promise<void> {
        const index = this.instances.findIndex(i => i.id.equals(instance.id));
        if (index !== -1) this.instances[index] = instance;
    }

    async save(instance: Instance): Promise<void> {
        this.instances.push(instance);
    }
}

interface Sut {
    usecase: CreateInstanceUsecase;
    instanceRepository: InMemoryInstanceRepository;
}

const makeSut = (): Sut => {
    const instanceRepository = new InMemoryInstanceRepository();
    const usecase = new CreateInstanceUsecase(instanceRepository);
    return { usecase, instanceRepository };
};

const makeInput = (overrides: Partial<{ player_id: PlayerId; difficulty: InstanceDifficulty }> = {}) => ({
    player_id: new PlayerId(),
    difficulty: InstanceDifficulty.NORMAL,
    ...overrides,
});

describe('CreateInstanceUsecase', () => {
    describe('sucesso', () => {
        it('deve criar uma instância com status PENDING', async () => {
            const { usecase } = makeSut();
            const [instance, error] = (await usecase.execute(makeInput())).asArray();

            expect(error).toBeNull();
            expect(instance.status).toBe(InstanceStatus.PENDING);
        });

        it('deve criar uma instância começando no andar 1', async () => {
            const { usecase } = makeSut();
            const [instance] = (await usecase.execute(makeInput())).asArray();

            expect(instance.current_floor).toBe(1);
        });

        it('deve criar uma instância com a dificuldade informada', async () => {
            const { usecase } = makeSut();
            const input = makeInput({ difficulty: InstanceDifficulty.HARD });
            const [instance] = (await usecase.execute(input)).asArray();

            expect(instance.difficulty).toBe(InstanceDifficulty.HARD);
        });

        it('deve associar a instância ao player correto', async () => {
            const { usecase } = makeSut();
            const player_id = new PlayerId();
            const [instance] = (await usecase.execute(makeInput({ player_id }))).asArray();

            expect(instance.player_id.equals(player_id)).toBe(true);
        });

        it('deve registrar a data de início da instância', async () => {
            const { usecase } = makeSut();
            const before = new Date();
            const [instance] = (await usecase.execute(makeInput())).asArray();
            const after = new Date();

            expect(instance.started_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(instance.started_at.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it('deve persistir a instância no repositório', async () => {
            const { usecase, instanceRepository } = makeSut();
            const [instance] = (await usecase.execute(makeInput())).asArray();

            const saved = await instanceRepository.findById(instance.id);
            expect(saved).not.toBeNull();
        });

        it('deve permitir que um jogador crie nova instância após a anterior ser abandonada', async () => {
            const { usecase, instanceRepository } = makeSut();
            const player_id = new PlayerId();

            const [first] = (await usecase.execute(makeInput({ player_id }))).asArray();
            first.abandon();

            const [second, error] = (await usecase.execute(makeInput({ player_id }))).asArray();

            expect(error).toBeNull();
            expect(second).toBeDefined();
        });

        it('deve permitir que um jogador crie nova instância após a anterior ter falhado', async () => {
            const { usecase, instanceRepository } = makeSut();
            const player_id = new PlayerId();

            const [first] = (await usecase.execute(makeInput({ player_id }))).asArray();
            first.fail();

            const [second, error] = (await usecase.execute(makeInput({ player_id }))).asArray();

            expect(error).toBeNull();
            expect(second).toBeDefined();
        });
    });

    describe('erro', () => {
        it('deve falhar se o jogador já possui uma instância ativa', async () => {
            const { usecase } = makeSut();
            const player_id = new PlayerId();

            await usecase.execute(makeInput({ player_id }));
            const [_, error] = (await usecase.execute(makeInput({ player_id }))).asArray();

            expect(error).toBeInstanceOf(PlayerAlreadyHasActiveInstanceError);
        });

        it('deve permitir que jogadores distintos criem instâncias simultaneamente', async () => {
            const { usecase } = makeSut();

            const [instance_a, error_a] = (await usecase.execute(makeInput({ player_id: new PlayerId() }))).asArray();
            const [instance_b, error_b] = (await usecase.execute(makeInput({ player_id: new PlayerId() }))).asArray();

            expect(error_a).toBeNull();
            expect(error_b).toBeNull();
            expect(instance_a.id.equals(instance_b.id)).toBe(false);
        });
    });
});
