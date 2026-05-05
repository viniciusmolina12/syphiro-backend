import { AggregateRoot } from '@shared/domain/aggregate-root';
import { Either } from '@shared/either';
import { EntityId } from '@shared/entity-id.vo';
import { PlayerId } from '@player/domain/player.aggregate';
import { CampaignChapterFloorId } from '@campaign/domain/entities/campaign-chapter-floor.entity';
import { InstanceFullError, InstanceNotPendingError, InstanceNotRunningError, InsufficientPlayersError } from '@instance/domain/errors';

export class InstanceId extends EntityId {}

export const INSTANCE_RULES = {
    MIN_PLAYERS: { value: 3 },
    MAX_PLAYERS: { value: 8 },
} as const;

export enum InstanceStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    ABANDONED = 'ABANDONED',
}

export enum InstanceDifficulty {
    EASY = 'EASY',
    NORMAL = 'NORMAL',
    HARD = 'HARD',
}

interface InstanceConstructorProps {
    id?: InstanceId;
    player_id: PlayerId;
    status: InstanceStatus;
    difficulty: InstanceDifficulty;
    campaign_chapter_floor_id: CampaignChapterFloorId;
    started_at: Date;
    participants: PlayerId[];
}

export interface CreateInstanceCommand {
    player_id: PlayerId;
    difficulty: InstanceDifficulty;
    campaign_chapter_floor_id: CampaignChapterFloorId;
}

export class Instance extends AggregateRoot {
    public readonly id: InstanceId;
    public readonly player_id: PlayerId;
    public readonly difficulty: InstanceDifficulty;
    public readonly started_at: Date;
    private _status: InstanceStatus;
    private _campaign_chapter_floor_id: CampaignChapterFloorId;
    private _participants: PlayerId[];

    private constructor(props: InstanceConstructorProps) {
        super();
        this.id = props.id ?? new InstanceId();
        this.player_id = props.player_id;
        this.difficulty = props.difficulty;
        this.started_at = props.started_at;
        this._status = props.status;
        this._campaign_chapter_floor_id = props.campaign_chapter_floor_id;
        this._participants = props.participants;
    }

    static rehydrate(props: InstanceConstructorProps): Instance {
        return new Instance(props);
    }

    static create(command: CreateInstanceCommand): Instance {
        return new Instance({
            player_id: command.player_id,
            difficulty: command.difficulty,
            status: InstanceStatus.PENDING,
            campaign_chapter_floor_id: command.campaign_chapter_floor_id,
            started_at: new Date(),
            participants: [command.player_id],
        });
    }

    get status(): InstanceStatus {
        return this._status;
    }

    get campaign_chapter_floor_id(): CampaignChapterFloorId {
        return this._campaign_chapter_floor_id;
    }

    get participants(): ReadonlyArray<PlayerId> {
        return [...this._participants];
    }

    isActive(): boolean {
        return this._status === InstanceStatus.PENDING || this._status === InstanceStatus.RUNNING;
    }

    isPending(): boolean {
        return this._status === InstanceStatus.PENDING;
    }

    isRunning(): boolean {
        return this._status === InstanceStatus.RUNNING;
    }

    isFull(): boolean {
        return this._participants.length >= INSTANCE_RULES.MAX_PLAYERS.value;
    }

    hasParticipant(player_id: PlayerId): boolean {
        return this._participants.some(p => p.equals(player_id));
    }

    addParticipant(player_id: PlayerId): void {
        if (!this.isPending()) throw new InstanceNotPendingError();
        if (this.isFull()) throw new InstanceFullError();
        this._participants.push(player_id);
    }

    start(): Either<void, InsufficientPlayersError> {
        if (this._participants.length < INSTANCE_RULES.MIN_PLAYERS.value) {
            return Either.fail(new InsufficientPlayersError());
        }
        this._status = InstanceStatus.RUNNING;
        return Either.ok(void 0);
    }

    advanceFloor(floor_id: CampaignChapterFloorId): void {
        this._campaign_chapter_floor_id = floor_id;
    }

    complete(): Either<void, InstanceNotRunningError> {
        if (!this.isRunning()) return Either.fail(new InstanceNotRunningError());
        this._status = InstanceStatus.COMPLETED;
        return Either.ok(void 0);
    }

    abandon(): Either<void, InstanceNotPendingError> {
        if (!this.isPending()) return Either.fail(new InstanceNotPendingError());
        this._status = InstanceStatus.ABANDONED;
        return Either.ok(void 0);
    }

    fail(): void {
        this._status = InstanceStatus.FAILED;
    }
}
