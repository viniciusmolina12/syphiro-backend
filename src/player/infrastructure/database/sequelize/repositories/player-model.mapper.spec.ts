import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { PlayerModel, playerModelSynced } from "../models/player.model";
import { PlayerModelMapper } from "./player-model.mapper";
import { Player, PlayerId } from "@player/domain/player.aggregate";
import { IdentityId } from "@player/domain/value-objects/identity_id.vo";
import { Name } from "@player/domain/value-objects/name.vo";

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_IDENTITY_ID = 'cognito|abc-123-def-456';
const VALID_NAME = 'Jon Snow';

const makeModel = (): PlayerModel =>
    new PlayerModel({ id: VALID_ID, name: VALID_NAME, identity_id: VALID_IDENTITY_ID });

const makePlayer = (): Player =>
    Player.rehydrate({
        id: new PlayerId(VALID_ID),
        identityId: new IdentityId(VALID_IDENTITY_ID),
        name: Name.create(VALID_NAME).ok,
    });

describe('PlayerModelMapper', () => {
    beforeAll(async () => {
        await playerModelSynced;
    });

    afterAll(async () => {
        await SEQUELIZE_CONFIG.close();
    });

    describe('toDomain', () => {
        it('deve retornar uma instância de Player', () => {
            const result = PlayerModelMapper.toDomain(makeModel());

            expect(result).toBeInstanceOf(Player);
        });

        it('deve mapear o id corretamente', () => {
            const result = PlayerModelMapper.toDomain(makeModel());

            expect(result.id).toBeInstanceOf(PlayerId);
            expect(result.id.toString()).toBe(VALID_ID);
        });

        it('deve mapear o identityId corretamente', () => {
            const result = PlayerModelMapper.toDomain(makeModel());

            expect(result.identityId).toBeInstanceOf(IdentityId);
            expect(result.identityId.value).toBe(VALID_IDENTITY_ID);
        });

        it('deve mapear o name corretamente', () => {
            const result = PlayerModelMapper.toDomain(makeModel());

            expect(result.name).toBeInstanceOf(Name);
            expect(result.name.value).toBe(VALID_NAME);
        });

        it('não deve emitir domain events ao reconstituir', () => {
            const result = PlayerModelMapper.toDomain(makeModel());

            expect(result.domainEvents).toHaveLength(0);
        });
    });

    describe('toModel', () => {
        it('deve retornar uma instância de PlayerModel', () => {
            const result = PlayerModelMapper.toModel(makePlayer());

            expect(result).toBeInstanceOf(PlayerModel);
        });

        it('deve mapear o id corretamente', () => {
            const result = PlayerModelMapper.toModel(makePlayer());

            expect(result.id).toBe(VALID_ID);
        });

        it('deve mapear o name corretamente', () => {
            const result = PlayerModelMapper.toModel(makePlayer());

            expect(result.name).toBe(VALID_NAME);
        });

        it('deve mapear o identity_id corretamente', () => {
            const result = PlayerModelMapper.toModel(makePlayer());

            expect(result.identity_id).toBe(VALID_IDENTITY_ID);
        });
    });
});
