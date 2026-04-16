import { AggregateRoot } from '../../@shared/domain/aggregate-root';
import { EntityId } from '../../@shared/entity-id.vo';
import { PlayerId } from '../../player/domain/player.aggregate';

export class InstanceId extends EntityId {}

export enum InstanceStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
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

    private constructor(props: InstanceConstructorProps) {
        super();
        this.id = props.id ?? new InstanceId();
        this.player_id = props.player_id;
        this.difficulty = props.difficulty;
        this.started_at = props.started_at;
        this._status = props.status;
        this._current_floor = props.current_floor;
    }

    static create(command: CreateInstanceCommand): Instance {
        return new Instance({
            player_id: command.player_id,
            difficulty: command.difficulty,
            status: InstanceStatus.ACTIVE,
            current_floor: 1,
            started_at: new Date(),
        });
    }

    get status(): InstanceStatus {
        return this._status;
    }

    get current_floor(): number {
        return this._current_floor;
    }

    isActive(): boolean {
        return this._status === InstanceStatus.ACTIVE;
    }

    advanceFloor(): void {
        this._current_floor++;
    }

    complete(): void {
        this._status = InstanceStatus.COMPLETED;
    }

    fail(): void {
        this._status = InstanceStatus.FAILED;
    }
}
