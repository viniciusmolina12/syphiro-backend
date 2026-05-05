import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { InstanceModel, instanceModelSynced } from "../models/instance.model";
import { InstanceParticipantsModel, instanceParticipantsModelSynced } from "../models/instance-participants.model";
import { InstanceSequelizeRepository } from "./instance-sequelize.repository";
import { Instance, InstanceId, InstanceStatus, InstanceDifficulty } from "@instance/domain/instance.aggregate";
import { PlayerId } from "@player/domain/player.aggregate";
import { PlayerModel, playerModelSynced } from "@player/infrastructure/database/sequelize/models/player.model";
import { CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_PLAYER_ID = 'b1c2d3e4-f5a6-7890-abcd-ef1234567891';
const OTHER_PLAYER_ID = 'c1d2e3f4-a5b6-7890-abcd-ef1234567892';
const VALID_FLOOR_ID = 'd1e2f3a4-b5c6-7890-abcd-ef1234567893';
const VALID_STARTED_AT = new Date('2024-01-01T00:00:00Z');

const makeInstance = (): Instance =>
    Instance.create({ player_id: new PlayerId(VALID_PLAYER_ID), difficulty: InstanceDifficulty.NORMAL, campaign_chapter_floor_id: new CampaignChapterFloorId(VALID_FLOOR_ID) });

const seedModel = async (overrides: Partial<{
    id: string;
    player_id: string;
    status: InstanceStatus;
    participants: string[];
}> = {}) => {
    const id = overrides.id ?? VALID_ID;
    const player_id = overrides.player_id ?? VALID_PLAYER_ID;
    const participants = overrides.participants ?? [player_id];
    
    try {
    await InstanceModel.create({
        id,
        player_id,
        status: overrides.status ?? InstanceStatus.PENDING,
        difficulty: InstanceDifficulty.NORMAL,
        campaign_chapter_floor_id: VALID_FLOOR_ID,
        started_at: VALID_STARTED_AT,
    });
}catch(e) {
    console.log(`ERRO AQUI NESSA PORRA`, e)
}

    await InstanceParticipantsModel.bulkCreate(
        participants.map(pid => ({ instance_id: id, player_id: pid })),
    );
};

const seedPlayer = async (player_id: string) => {
    await PlayerModel.create({
        id: player_id,
        name: 'John Doe',
        identity_id: 'cognito|abc-123-def-456',
    });
};

describe('InstanceSequelizeRepository', () => {
    let repository: InstanceSequelizeRepository;

    beforeEach(async () => {
        repository = new InstanceSequelizeRepository();
        await SEQUELIZE_CONFIG.truncate();
    });
    afterAll(async () => {
        await SEQUELIZE_CONFIG.truncate();
    });



    describe('save', () => {
        it('deve persistir a instance no banco de dados', async () => {
         
            const instance = makeInstance();
            await seedPlayer(instance.player_id.toString());
            await repository.save(instance);

            const record = await InstanceModel.findOne({ where: { id: instance.id.toString() } });
            expect(record).not.toBeNull();
            expect(record!.player_id).toBe(instance.player_id.toString());
            expect(record!.status).toBe(InstanceStatus.PENDING);
            expect(record!.difficulty).toBe(InstanceDifficulty.NORMAL);
            expect(record!.campaign_chapter_floor_id).toBe(VALID_FLOOR_ID);
        });

        it('deve persistir os participants na tabela de participantes', async () => {
            const instance = makeInstance();
            await seedPlayer(instance.player_id.toString());
            await repository.save(instance);

            const participants = await InstanceParticipantsModel.findAll({
                where: { instance_id: instance.id.toString() },
            });
            expect(participants).toHaveLength(1);
            expect(participants[0].player_id).toBe(instance.player_id.toString());
        });

        it('deve persistir created_at e updated_at automaticamente', async () => {
            const instance = makeInstance();
            await seedPlayer(instance.player_id.toString());
            await repository.save(instance);

            const record = await InstanceModel.findOne({ where: { id: instance.id.toString() } });
            expect(record!.created_at).toBeInstanceOf(Date);
            expect(record!.updated_at).toBeInstanceOf(Date);
        });
    });

    describe('findById', () => {
        it('deve retornar null quando a instance não existe', async () => {
            const result = await repository.findById(new InstanceId(VALID_ID));

            expect(result).toBeNull();
        });

        it('deve retornar a instance quando ela existe', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel();

            const result = await repository.findById(new InstanceId(VALID_ID));

            expect(result).toBeInstanceOf(Instance);
            expect(result!.id.toString()).toBe(VALID_ID);
            expect(result!.player_id.toString()).toBe(VALID_PLAYER_ID);
            expect(result!.status).toBe(InstanceStatus.PENDING);
        });

        it('deve retornar a instance com seus participants', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedPlayer(OTHER_PLAYER_ID);
            await seedModel({ participants: [VALID_PLAYER_ID, OTHER_PLAYER_ID] });

            const result = await repository.findById(new InstanceId(VALID_ID));

            expect(result!.participants).toHaveLength(2);
        });
    });

    describe('existsById', () => {
        it('deve retornar false quando a instance não existe', async () => {
            const result = await repository.existsById(new InstanceId(VALID_ID));

            expect(result).toBe(false);
        });

        it('deve retornar true quando a instance existe', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel();

            const result = await repository.existsById(new InstanceId(VALID_ID));

            expect(result).toBe(true);
        });
    });

    describe('findActiveByPlayerId', () => {
        it('deve retornar null quando não há instance ativa para o player', async () => {
            const result = await repository.findActiveByPlayerId(new PlayerId(VALID_PLAYER_ID));

            expect(result).toBeNull();
        });

        it('deve retornar a instance ativa do criador', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel();

            const result = await repository.findActiveByPlayerId(new PlayerId(VALID_PLAYER_ID));

            expect(result).toBeInstanceOf(Instance);
            expect(result!.id.toString()).toBe(VALID_ID);
        });

        it('deve retornar a instance ativa de um participante não criador', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedPlayer(OTHER_PLAYER_ID);
            await seedModel({ participants: [VALID_PLAYER_ID, OTHER_PLAYER_ID] });

            const result = await repository.findActiveByPlayerId(new PlayerId(OTHER_PLAYER_ID));

            expect(result).toBeInstanceOf(Instance);
            expect(result!.id.toString()).toBe(VALID_ID);
        });

        it('deve retornar a instance com status RUNNING', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel({ status: InstanceStatus.RUNNING });

            const result = await repository.findActiveByPlayerId(new PlayerId(VALID_PLAYER_ID));

            expect(result).toBeInstanceOf(Instance);
            expect(result!.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve retornar null quando a instance está COMPLETED', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel({ status: InstanceStatus.COMPLETED });

            const result = await repository.findActiveByPlayerId(new PlayerId(VALID_PLAYER_ID));

            expect(result).toBeNull();
        });

        it('deve retornar null quando a instance está ABANDONED', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel({ status: InstanceStatus.ABANDONED });

            const result = await repository.findActiveByPlayerId(new PlayerId(VALID_PLAYER_ID));

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('deve atualizar o status da instance', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel();
            const instance = Instance.rehydrate({
                id: new InstanceId(VALID_ID),
                player_id: new PlayerId(VALID_PLAYER_ID),
                status: InstanceStatus.RUNNING,
                difficulty: InstanceDifficulty.NORMAL,
                campaign_chapter_floor_id: new CampaignChapterFloorId(VALID_FLOOR_ID),
                started_at: VALID_STARTED_AT,
                participants: [new PlayerId(VALID_PLAYER_ID)],
            });

            await repository.update(instance);

            const record = await InstanceModel.findOne({ where: { id: VALID_ID } });
            expect(record!.status).toBe(InstanceStatus.RUNNING);
        });

        it('deve atualizar o campaign_chapter_floor_id da instance', async () => {
            const NEW_FLOOR_ID = 'e1f2a3b4-c5d6-7890-abcd-ef1234567894';
            await seedPlayer(VALID_PLAYER_ID);
            await seedModel();
            const instance = Instance.rehydrate({
                id: new InstanceId(VALID_ID),
                player_id: new PlayerId(VALID_PLAYER_ID),
                status: InstanceStatus.RUNNING,
                difficulty: InstanceDifficulty.NORMAL,
                campaign_chapter_floor_id: new CampaignChapterFloorId(NEW_FLOOR_ID),
                started_at: VALID_STARTED_AT,
                participants: [new PlayerId(VALID_PLAYER_ID)],
            });

            await repository.update(instance);

            const record = await InstanceModel.findOne({ where: { id: VALID_ID } });
            expect(record!.campaign_chapter_floor_id).toBe(NEW_FLOOR_ID);
        });

        it('deve atualizar os participants da instance', async () => {
            await seedPlayer(VALID_PLAYER_ID);
            await seedPlayer(OTHER_PLAYER_ID);
            await seedModel();
            const instance = Instance.rehydrate({
                id: new InstanceId(VALID_ID),
                player_id: new PlayerId(VALID_PLAYER_ID),
                status: InstanceStatus.PENDING,
                difficulty: InstanceDifficulty.NORMAL,
                campaign_chapter_floor_id: new CampaignChapterFloorId(VALID_FLOOR_ID),
                started_at: VALID_STARTED_AT,
                participants: [new PlayerId(VALID_PLAYER_ID), new PlayerId(OTHER_PLAYER_ID)],
            });

            await repository.update(instance);

            const participants = await InstanceParticipantsModel.findAll({
                where: { instance_id: VALID_ID },
            });
            expect(participants).toHaveLength(2);
            expect(participants.map(p => p.player_id)).toContain(OTHER_PLAYER_ID);
        });
    });
});
