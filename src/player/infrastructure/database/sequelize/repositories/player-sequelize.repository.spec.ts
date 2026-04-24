import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { PlayerModel, playerModelSynced } from "../models/player.model";
import { PlayerSequelizeRepository } from "./player-sequelize.repository";
import { Player } from "@player/domain/player.aggregate";
import { IdentityId } from "@player/domain/value-objects/identity_id.vo";

const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const VALID_IDENTITY_ID = 'cognito|abc-123-def-456';
const VALID_NAME = 'Jon Snow';

const makePlayer = (): Player =>
    Player.create({ identity_id: VALID_IDENTITY_ID, name: VALID_NAME }).ok;

describe('PlayerSequelizeRepository', () => {
    let repository: PlayerSequelizeRepository;

    // beforeAll(async () => {
    //     await playerModelSynced;
    // });

    beforeEach(async () => {
        repository = new PlayerSequelizeRepository();
        // await PlayerModel.destroy({ where: {}, truncate: true });
       
    });

    afterAll(async () => {
        await SEQUELIZE_CONFIG.drop();
        await SEQUELIZE_CONFIG.close();
    });

    describe('save', () => {
        it('deve persistir o player no banco de dados', async () => {
            const player = makePlayer();

            await repository.save(player);

            const record = await PlayerModel.findOne({ where: { id: player.id.toString() } });
            expect(record).not.toBeNull();
            expect(record!.id).toBe(player.id.toString());
            expect(record!.name).toBe(VALID_NAME);
            expect(record!.identity_id).toBe(VALID_IDENTITY_ID);
        });

        it('deve persistir created_at e updated_at automaticamente', async () => {
            const player = makePlayer();

            await repository.save(player);

            const record = await PlayerModel.findOne({ where: { identity_id: VALID_IDENTITY_ID } });
            expect(record!.created_at).toBeInstanceOf(Date);
            expect(record!.updated_at).toBeInstanceOf(Date);
        });
    });

    describe('findByIdentityId', () => {
        it('deve retornar null quando o player não existe', async () => {
            const identityId = IdentityId.create(VALID_IDENTITY_ID).ok;

            const result = await repository.findByIdentityId(identityId);

            expect(result).toBeNull();
        });

        it('deve retornar o player quando ele existe', async () => {
            await PlayerModel.create({
                id: VALID_ID,
                name: VALID_NAME,
                identity_id: VALID_IDENTITY_ID,
            });
            const identityId = IdentityId.create(VALID_IDENTITY_ID).ok;

            const result = await repository.findByIdentityId(identityId);

            expect(result).toBeInstanceOf(Player);
            expect(result!.id.toString()).toBe(VALID_ID);
            expect(result!.identity_id.value).toBe(VALID_IDENTITY_ID);
            expect(result!.name.value).toBe(VALID_NAME);
        });
    });

    describe('existsByIdentityId', () => {
        it('deve retornar false quando o player não existe', async () => {
            const identityId = IdentityId.create(VALID_IDENTITY_ID).ok;

            const result = await repository.existsByIdentityId(identityId);

            expect(result).toBe(false);
        });

        it('deve retornar true quando o player existe', async () => {
            await PlayerModel.create({
                id: VALID_ID,
                name: VALID_NAME,
                identity_id: VALID_IDENTITY_ID,
            });
            const identityId = IdentityId.create(VALID_IDENTITY_ID).ok;

            const result = await repository.existsByIdentityId(identityId);

            expect(result).toBe(true);
        });
    });
});
