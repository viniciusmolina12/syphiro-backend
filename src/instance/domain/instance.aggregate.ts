import { AggregateRoot } from '../../@shared/domain/aggregate-root';
import { Either } from '../../@shared/either';
import { EntityId } from '../../@shared/entity-id.vo';
import { PlayerId } from '../../player/domain/player.aggregate';
import { InstanceFullError, InstanceNotPendingError, InstanceNotRunningError, InsufficientPlayersError } from './errors';

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
    current_floor: number;
    started_at: Date;
    participants: PlayerId[];
}

export interface CreateInstanceCommand {
    player_id: PlayerId;
    difficulty: InstanceDifficulty;
}

export class Instance extends AggregateRoot {
    public readonly id: InstanceId;
    public readonly player_id: PlayerId;
    public readonly difficulty: InstanceDifficulty;
    public readonly started_at: Date;
    private _status: InstanceStatus;
    private _current_floor: number;
    private _participants: PlayerId[];

    private constructor(props: InstanceConstructorProps) {
        super();
        this.id = props.id ?? new InstanceId();
        this.player_id = props.player_id;
        this.difficulty = props.difficulty;
        this.started_at = props.started_at;
        this._status = props.status;
        this._current_floor = props.current_floor;
        this._participants = props.participants;
    }

    static create(command?: CreateInstanceCommand): Instance {
        const player_id = command?.player_id ?? new PlayerId();
        return new Instance({
            player_id,
            difficulty: command?.difficulty ?? InstanceDifficulty.NORMAL,
            status: InstanceStatus.PENDING,
            current_floor: 1,
            started_at: new Date(),
            participants: [player_id],
        });
    }

    get status(): InstanceStatus {
        return this._status;
    }

    get current_floor(): number {
        return this._current_floor;
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

    advanceFloor(): void {
        this._current_floor++;
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
