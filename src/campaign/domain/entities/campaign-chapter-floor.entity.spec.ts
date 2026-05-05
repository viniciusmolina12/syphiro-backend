import { EnemyId } from '@enemy/domain/enemy.aggregate';
import { CampaignChapterFloor, CampaignChapterFloorId } from '@campaign/domain/entities/campaign-chapter-floor.entity';

const makeFloor = (floor_number = 1) =>
    CampaignChapterFloor.create({ floor_number, enemy_id: new EnemyId() });

describe('CampaignChapterFloor', () => {
    describe('create', () => {
        it('deve criar um andar com os dados fornecidos', () => {
            const enemy_id = new EnemyId();
            const floor = CampaignChapterFloor.create({ floor_number: 3, enemy_id });

            expect(floor.floor_number).toBe(3);
            expect(floor.enemy_id).toBe(enemy_id);
            expect(floor.id).toBeInstanceOf(CampaignChapterFloorId);
        });
    });

    describe('rehydrate', () => {
        it('deve reidratrar com o id fornecido', () => {
            const id = new CampaignChapterFloorId();
            const floor = CampaignChapterFloor.rehydrate({ id, floor_number: 1, enemy_id: new EnemyId() });

            expect(floor.id).toBe(id);
        });
    });
});
