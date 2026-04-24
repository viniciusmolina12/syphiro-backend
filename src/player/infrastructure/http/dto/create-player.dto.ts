export class CreatePlayerDto {
    identity_id!: string;
    name!: string;
}

export interface CreatePlayerResponseDto {
    id: string;
    name: string;
    identity_id: string;
}