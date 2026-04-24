import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { DataTypes, Model, Optional } from "sequelize";

export interface InstanceAttributes {
    id: string;
    player_id: string;
    status: string;
    difficulty: string;
    current_floor: number;
    started_at: Date;
    created_at: Date;
    updated_at: Date;
}

export type InstanceCreationAttributes = Optional<
    InstanceAttributes,
    "id" | "created_at" | "updated_at"
>;

export class InstanceModel extends Model<InstanceAttributes, InstanceCreationAttributes>
    implements InstanceAttributes
{
    public id!: string;
    public player_id!: string;
    public status!: string;
    public difficulty!: string;
    public current_floor!: number;
    public started_at!: Date;
    public created_at!: Date;
    public updated_at!: Date;

    public instanceParticipants?: { instance_id: string; player_id: string }[];
}

InstanceModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        player_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        difficulty: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        current_floor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        started_at: {
            type: DataTypes.DATE,
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
        modelName: "Instance",
    },
);

export const instanceModelSynced = InstanceModel.sync();
