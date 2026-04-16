import { PlayerId } from '@player/domain/player.aggregate';
import { INSTANCE_RULES, Instance, InstanceDifficulty, InstanceStatus } from '@instance/domain/instance.aggregate';
import { InstanceNotRunningError, InstanceNotPendingError, InsufficientPlayersError } from '@instance/domain/errors';

const makePendingInstance = () =>
    Instance.create({ player_id: new PlayerId(), difficulty: InstanceDifficulty.NORMAL });

const makeRunningInstance = () => {
    const instance = makePendingInstance();
    for (let i = 1; i < INSTANCE_RULES.MIN_PLAYERS.value; i++) {
        instance.addParticipant(new PlayerId());
    }
    instance.start();
    return instance;
};

describe('Instance Aggregate', () => {
    describe('start', () => {
        it('deve transitar para RUNNING quando o mínimo de jogadores for atingido', () => {
            const instance = makePendingInstance();
            for (let i = 1; i < INSTANCE_RULES.MIN_PLAYERS.value; i++) {
                instance.addParticipant(new PlayerId());
            }

            const [_, error] = instance.start().asArray();

            expect(error).toBeNull();
            expect(instance.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve falhar se o número de jogadores for insuficiente', () => {
            const instance = makePendingInstance();

            const [_, error] = instance.start().asArray();

            expect(error).toBeInstanceOf(InsufficientPlayersError);
            expect(instance.status).toBe(InstanceStatus.PENDING);
        });
    });

    describe('complete', () => {
        it('deve transitar para COMPLETED quando a instância estiver RUNNING', () => {
            const instance = makeRunningInstance();

            const [_, error] = instance.complete().asArray();

            expect(error).toBeNull();
            expect(instance.status).toBe(InstanceStatus.COMPLETED);
        });

        it('deve falhar se a instância estiver PENDING', () => {
            const instance = makePendingInstance();

            const [_, error] = instance.complete().asArray();

            expect(error).toBeInstanceOf(InstanceNotRunningError);
            expect(instance.status).toBe(InstanceStatus.PENDING);
        });

        it('deve falhar se a instância estiver ABANDONED', () => {
            const instance = makePendingInstance();
            instance.abandon();

            const [_, error] = instance.complete().asArray();

            expect(error).toBeInstanceOf(InstanceNotRunningError);
            expect(instance.status).toBe(InstanceStatus.ABANDONED);
        });

        it('deve falhar se a instância já estiver COMPLETED', () => {
            const instance = makeRunningInstance();
            instance.complete();

            const [_, error] = instance.complete().asArray();

            expect(error).toBeInstanceOf(InstanceNotRunningError);
        });

        it('deve falhar se a instância já estiver FAILED', () => {
            const instance = makeRunningInstance();
            instance.fail();

            const [_, error] = instance.complete().asArray();

            expect(error).toBeInstanceOf(InstanceNotRunningError);
        });
    });

    describe('abandon', () => {
        it('deve transitar para ABANDONED quando a instância estiver PENDING', () => {
            const instance = makePendingInstance();

            const [_, error] = instance.abandon().asArray();

            expect(error).toBeNull();
            expect(instance.status).toBe(InstanceStatus.ABANDONED);
        });

        it('deve falhar se a instância estiver RUNNING', () => {
            const instance = makeRunningInstance();

            const [_, error] = instance.abandon().asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
            expect(instance.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve falhar se a instância já estiver COMPLETED', () => {
            const instance = makeRunningInstance();
            instance.complete();

            const [_, error] = instance.abandon().asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância já estiver FAILED', () => {
            const instance = makeRunningInstance();
            instance.fail();

            const [_, error] = instance.abandon().asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('deve falhar se a instância já estiver ABANDONED', () => {
            const instance = makePendingInstance();
            instance.abandon();

            const [_, error] = instance.abandon().asArray();

            expect(error).toBeInstanceOf(InstanceNotPendingError);
        });

        it('uma instância abandonada não deve ser considerada ativa', () => {
            const instance = makePendingInstance();
            instance.abandon();

            expect(instance.isActive()).toBe(false);
        });
    });
});
