import { AggregateRoot } from '@shared/domain/aggregate-root';
import { Either } from '@shared/either';
import { EntityId } from '@shared/entity-id.vo';
import { CampaignChapter, CampaignChapterId } from '@campaign/domain/entities/campaign-chapter.entity';
import { DuplicateChapterNumberError } from '@campaign/domain/errors/duplicate-chapter-number.error';

export class CampaignId extends EntityId {}

interface CampaignConstructorProps {
    id?: CampaignId;
    chapters?: CampaignChapter[];
}

export class Campaign extends AggregateRoot {
    public readonly id: CampaignId;
    private _chapters: CampaignChapter[];

    private constructor(props: CampaignConstructorProps) {
        super();
        this.id = props.id ?? new CampaignId();
        this._chapters = props.chapters ?? [];
    }

    static create(): Campaign {
        return new Campaign({});
    }

    static rehydrate(props: CampaignConstructorProps): Campaign {
        return new Campaign(props);
    }

    get chapters(): ReadonlyArray<CampaignChapter> {
        return [...this._chapters];
    }

    addChapter(chapter: CampaignChapter): Either<void, DuplicateChapterNumberError> {
        if (this.hasChapter(chapter.chapter_number)) {
            return Either.fail(new DuplicateChapterNumberError());
        }
        this._chapters.push(chapter);
        return Either.ok(void 0);
    }

    findChapterByNumber(chapter_number: number): CampaignChapter | null {
        return this._chapters.find(c => c.chapter_number === chapter_number) ?? null;
    }

    findChapterById(chapter_id: CampaignChapterId): CampaignChapter | null {
        return this._chapters.find(c => c.id.equals(chapter_id)) ?? null;
    }

    hasChapter(chapter_number: number): boolean {
        return this._chapters.some(c => c.chapter_number === chapter_number);
    }
}
