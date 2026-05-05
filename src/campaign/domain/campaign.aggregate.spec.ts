import { EnemyId } from '@enemy/domain/enemy.aggregate';
import { CampaignChapterFloor } from '@campaign/domain/entities/campaign-chapter-floor.entity';
import { CampaignChapter, CampaignChapterId } from '@campaign/domain/entities/campaign-chapter.entity';
import { Campaign, CampaignId } from '@campaign/domain/campaign.aggregate';
import { DuplicateChapterNumberError } from '@campaign/domain/errors/duplicate-chapter-number.error';

const makeChapter = (chapter_number: number, floorCount = 0) => {
    const chapter = CampaignChapter.create({ description: `Capítulo ${chapter_number}`, chapter_number });
    const floors: CampaignChapterFloor[] = []
    for (let i = 1; i <= floorCount; i++) {
        const floor = CampaignChapterFloor.create({enemy_id: new EnemyId(), floor_number: i})
        floors.push(floor)
    }
    return chapter;
};

describe('Campaign Aggregate', () => {
    describe('create', () => {
        it('deve criar uma campanha sem capítulos', () => {
            const campaign = Campaign.create();

            expect(campaign.chapters).toHaveLength(0);
            expect(campaign.id).toBeInstanceOf(CampaignId);
        });
    });

    describe('rehydrate', () => {
        it('deve reidratar com o id e capítulos fornecidos', () => {
            const id = new CampaignId();
            const chapters = [makeChapter(1), makeChapter(2)];
            const campaign = Campaign.rehydrate({ id, chapters });

            expect(campaign.id).toBe(id);
            expect(campaign.chapters).toHaveLength(2);
        });
    });

    describe('addChapter', () => {
        it('deve adicionar um capítulo à campanha', () => {
            const campaign = Campaign.create();

            const [_, error] = campaign.addChapter(makeChapter(1)).asArray();

            expect(error).toBeNull();
            expect(campaign.chapters).toHaveLength(1);
        });

        it('deve falhar ao adicionar capítulo com número duplicado', () => {
            const campaign = Campaign.create();
            campaign.addChapter(makeChapter(1));

            const [_, error] = campaign.addChapter(makeChapter(1)).asArray();

            expect(error).toBeInstanceOf(DuplicateChapterNumberError);
            expect(campaign.chapters).toHaveLength(1);
        });

        it('deve permitir múltiplos capítulos com números distintos', () => {
            const campaign = Campaign.create();
            campaign.addChapter(makeChapter(1));
            campaign.addChapter(makeChapter(2));
            campaign.addChapter(makeChapter(3));

            expect(campaign.chapters).toHaveLength(3);
        });
    });

    describe('findChapterByNumber', () => {
        it('deve retornar o capítulo quando encontrado', () => {
            const campaign = Campaign.create();
            const chapter = makeChapter(2);
            campaign.addChapter(chapter);

            expect(campaign.findChapterByNumber(2)).toBe(chapter);
        });

        it('deve retornar null quando o capítulo não existir', () => {
            const campaign = Campaign.create();

            expect(campaign.findChapterByNumber(99)).toBeNull();
        });
    });

    describe('findChapterById', () => {
        it('deve retornar o capítulo pelo id', () => {
            const campaign = Campaign.create();
            const chapter = makeChapter(1);
            campaign.addChapter(chapter);

            expect(campaign.findChapterById(chapter.id)).toBe(chapter);
        });

        it('deve retornar null quando o id não existir', () => {
            const campaign = Campaign.create();

            expect(campaign.findChapterById(new CampaignChapterId())).toBeNull();
        });
    });

    describe('hasChapter', () => {
        it('deve retornar true quando o capítulo existir', () => {
            const campaign = Campaign.create();
            campaign.addChapter(makeChapter(4));

            expect(campaign.hasChapter(4)).toBe(true);
        });

        it('deve retornar false quando o capítulo não existir', () => {
            const campaign = Campaign.create();

            expect(campaign.hasChapter(4)).toBe(false);
        });
    });
});
