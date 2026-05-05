import { EnemyId } from '@enemy/domain/enemy.aggregate';
import { CampaignChapterFloor, CampaignChapterFloorId } from '@campaign/domain/entities/campaign-chapter-floor.entity';
import { CampaignChapter, CampaignChapterId } from '@campaign/domain/entities/campaign-chapter.entity';

const makeChapter = (chapter_number = 1) =>
    CampaignChapter.create({ description: 'Prólogo', chapter_number });

const makeFloor = (floor_number: number) =>
    CampaignChapterFloor.create({ floor_number, enemy_id: new EnemyId() });

describe('CampaignChapter', () => {
    describe('create', () => {
        it('deve criar um capítulo sem andares', () => {
            const chapter = makeChapter();

            expect(chapter.chapter_number).toBe(1);
            expect(chapter.description).toBe('Prólogo');
            expect(chapter.floors).toHaveLength(0);
            expect(chapter.id).toBeInstanceOf(CampaignChapterId);
        });
    });

    describe('rehydrate', () => {
        it('deve reidratar com o id e andares fornecidos', () => {
            const id = new CampaignChapterId();
            const floors = [makeFloor(1), makeFloor(2)];
            const chapter = CampaignChapter.rehydrate({ id, description: 'Cap 1', chapter_number: 1, floors });

            expect(chapter.id).toBe(id);
            expect(chapter.floors).toHaveLength(2);
        });
    });


    describe('findFloorByNumber', () => {
        it('deve retornar o andar quando encontrado', () => {
            const floor = makeFloor(2);
            const chapter = CampaignChapter.rehydrate({chapter_number: 1, description: "teste", floors: [floor], id: new CampaignChapterId()}) 

            expect(chapter.findFloorByNumber(2)).toBe(floor);
        });

        it('deve retornar null quando o andar não existir', () => {
            const chapter = makeChapter();

            expect(chapter.findFloorByNumber(99)).toBeNull();
        });
    });

    describe('findFloorById', () => {
        it('deve retornar o andar pelo id', () => {
            const floor = makeFloor(1);
            const chapter = CampaignChapter.rehydrate({id: new CampaignChapterId(), chapter_number: 2, floors: [floor], description: "Teste"})

            expect(chapter.findFloorById(floor.id)).toBe(floor);
        });

        it('deve retornar null quando o id não existir', () => {
            const chapter = makeChapter();

            expect(chapter.findFloorById(new CampaignChapterFloorId())).toBeNull();
        });
    });

    describe('hasFloor', () => {
        it('deve retornar true quando o andar existir', () => {
            const floor = makeFloor(5)
            const chapter = CampaignChapter.rehydrate({id: new CampaignChapterId(), chapter_number: 2, floors: [floor], description: "Teste"})
            expect(chapter.hasFloor(5)).toBe(true);
        });

        it('deve retornar false quando o andar não existir', () => {
            const chapter = makeChapter();

            expect(chapter.hasFloor(5)).toBe(false);
        });
    });
});
