import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';
import { DataTypes, Model, Optional } from 'sequelize';
import { SkillTypeModel } from './skill-type.model';

export interface SkillAttributes {
    id: string;
    name: string;
    description: string;
    icon: string;
    cooldown: number;
    base_damage: number;
    type_id: string;
}

export type SkillCreationAttributes = Optional<SkillAttributes, never>;

export class SkillModel
    extends Model<SkillAttributes, SkillCreationAttributes>
    implements SkillAttributes
{
    public id!: string;
    public name!: string;
    public description!: string;
    public icon!: string;
    public cooldown!: number;
    public base_damage!: number;
    public type_id!: string;

    public readonly skill_type?: SkillTypeModel;
}

SkillModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cooldown: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        base_damage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: 'skill_type', key: 'id' },
        },
    },
    {
        sequelize: SEQUELIZE_CONFIG,
        modelName: 'Skill',
        tableName: 'skills',
        timestamps: false,
    },
);

SkillModel.belongsTo(SkillTypeModel, { foreignKey: 'type_id', as: 'skill_type' });

export const skillModelSynced = SkillModel.sync();
