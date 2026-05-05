import { EntityId } from '@shared/entity-id.vo';
import { Either } from '@shared/either';
import { CampaignChapterFloor, CampaignChapterFloorId } from '@campaign/domain/entities/campaign-chapter-floor.entity';
import { DuplicateFloorNumberError } from '@campaign/domain/errors/duplicate-floor-number.error';

export class CampaignChapterId extends EntityId {}

interface CampaignChapterConstructorProps {
    id?: CampaignChapterId;
    description: string;
    chapter_number: number;
    floors?: CampaignChapterFloor[];
}

export interface CreateCampaignChapterCommand {
    description: string;
    chapter_number: number;
}

export class CampaignChapter {
    public readonly id: CampaignChapterId;
    public readonly description: string;
    public readonly chapter_number: number;
    private _floors: CampaignChapterFloor[];

    private constructor(props: CampaignChapterConstructorProps) {
        this.id = props.id ?? new CampaignChapterId();
        this.description = props.description;
        this.chapter_number = props.chapter_number;
        this._floors = props.floors ?? [];
    }

    static create(command: CreateCampaignChapterCommand): CampaignChapter {
        return new CampaignChapter(command);
    }

    static rehydrate(props: CampaignChapterConstructorProps): CampaignChapter {
        return new CampaignChapter(props);
    }

    get floors(): ReadonlyArray<CampaignChapterFloor> {
        return [...this._floors];
    }


    findFloorByNumber(floor_number: number): CampaignChapterFloor | null {
        return this._floors.find(f => f.floor_number === floor_number) ?? null;
    }

    findFloorById(floor_id: CampaignChapterFloorId): CampaignChapterFloor | null {
        return this._floors.find(f => f.id.equals(floor_id)) ?? null;
    }

    hasFloor(floor_number: number): boolean {
        return this._floors.some(f => f.floor_number === floor_number);
    }
}
