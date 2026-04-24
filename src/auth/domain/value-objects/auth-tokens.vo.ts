import { ValueObject } from '@shared/value-object';

export interface AuthTokensProps {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
}

export class AuthTokens extends ValueObject {
    public readonly access_token: string;
    public readonly id_token: string;
    public readonly refresh_token: string;
    public readonly expires_in: number;

    constructor(props: AuthTokensProps) {
        super();
        this.access_token = props.access_token;
        this.id_token = props.id_token;
        this.refresh_token = props.refresh_token;
        this.expires_in = props.expires_in;
    }
}
