import { InstanceModel } from "../models/instance.model";
import { InstanceModelMapper } from "./instance-model.mapper";
import { Instance, InstanceId, InstanceStatus, InstanceDifficulty } from "@instance/domain/instance.aggregate";
import { PlayerId } from "@player/domain/player.aggregate";
import { CampaignChapterFloorId } from "@campaign/domain/entities/campaign-chapter-floor.entity";

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_PLAYER_ID = 'b1c2d3e4-f5a6-7890-abcd-ef1234567891';
const VALID_FLOOR_ID = 'c1d2e3f4-a5b6-7890-abcd-ef1234567892';
const VALID_STARTED_AT = new Date('2024-01-01T00:00:00Z');

const makeModel = (): InstanceModel => {
    const model = new InstanceModel({
        id: VALID_ID,
        player_id: VALID_PLAYER_ID,
        status: InstanceStatus.PENDING,
        difficulty: InstanceDifficulty.NORMAL,
        campaign_chapter_floor_id: VALID_FLOOR_ID,
        started_at: VALID_STARTED_AT,
    });
    model.instanceParticipants = [{ instance_id: VALID_ID, player_id: VALID_PLAYER_ID }];
    return model;
};

const makeInstance = (): Instance =>
    Instance.rehydrate({
        id: new InstanceId(VALID_ID),
        player_id: new PlayerId(VALID_PLAYER_ID),
        status: InstanceStatus.PENDING,
        difficulty: InstanceDifficulty.NORMAL,
        campaign_chapter_floor_id: new CampaignChapterFloorId(VALID_FLOOR_ID),
        started_at: VALID_STARTED_AT,
        participants: [new PlayerId(VALID_PLAYER_ID)],
    });

describe('InstanceModelMapper', () => {

    describe('toDomain', () => {
        it('deve retornar uma instância de Instance', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result).toBeInstanceOf(Instance);
        });

        it('deve mapear o id corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.id).toBeInstanceOf(InstanceId);
            expect(result.id.toString()).toBe(VALID_ID);
        });

        it('deve mapear o player_id corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.player_id).toBeInstanceOf(PlayerId);
            expect(result.player_id.toString()).toBe(VALID_PLAYER_ID);
        });

        it('deve mapear o status corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.status).toBe(InstanceStatus.PENDING);
        });

        it('deve mapear o difficulty corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.difficulty).toBe(InstanceDifficulty.NORMAL);
        });

        it('deve mapear o campaign_chapter_floor_id corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.campaign_chapter_floor_id).toBeInstanceOf(CampaignChapterFloorId);
            expect(result.campaign_chapter_floor_id.toString()).toBe(VALID_FLOOR_ID);
        });

        it('deve mapear o started_at corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.started_at).toEqual(VALID_STARTED_AT);
        });

        it('deve mapear os participants corretamente', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.participants).toHaveLength(1);
            expect(result.participants[0]).toBeInstanceOf(PlayerId);
            expect(result.participants[0].toString()).toBe(VALID_PLAYER_ID);
        });

        it('não deve emitir domain events ao reconstituir', () => {
            const result = InstanceModelMapper.toDomain(makeModel());

            expect(result.domainEvents).toHaveLength(0);
        });
    });

    describe('toModel', () => {
        it('deve retornar uma instância de InstanceModel', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result).toBeInstanceOf(InstanceModel);
        });

        it('deve mapear o id corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.id).toBe(VALID_ID);
        });

        it('deve mapear o player_id corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.player_id).toBe(VALID_PLAYER_ID);
        });

        it('deve mapear o status corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.status).toBe(InstanceStatus.PENDING);
        });

        it('deve mapear o difficulty corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.difficulty).toBe(InstanceDifficulty.NORMAL);
        });

        it('deve mapear o campaign_chapter_floor_id corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.campaign_chapter_floor_id).toBe(VALID_FLOOR_ID);
        });

        it('deve mapear o started_at corretamente', () => {
            const result = InstanceModelMapper.toModel(makeInstance());

            expect(result.started_at).toEqual(VALID_STARTED_AT);
        });
    });
});
