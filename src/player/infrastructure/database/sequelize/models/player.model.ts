import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { DataTypes, Model, Optional } from "sequelize";

export interface PlayerAttributes {
    id: string;
    name: string;
    identity_id: string;
    created_at: Date;
    updated_at: Date;
}

export type PlayerCreationAttributes = Optional<
    PlayerAttributes,
    "id" | "created_at" | "updated_at"
>;

export class PlayerModel extends Model<PlayerAttributes, PlayerCreationAttributes>
    implements PlayerAttributes
{
    public id!: string;
    public name!: string;
    public identity_id!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

PlayerModel.init(
    { 
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        identity_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize: SEQUELIZE_CONFIG,
        modelName: "Player",
        tableName: 'players',
        timestamps: false,
    },
);

export const playerModelSynced = PlayerModel.sync();
