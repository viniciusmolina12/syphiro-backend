import { SEQUELIZE_CONFIG } from '@shared/infrastructure/database/sequelize/config';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SkillTypeAttributes {
    id: string;
    description: string;
}

export type SkillTypeCreationAttributes = Optional<SkillTypeAttributes, never>;

export class SkillTypeModel
    extends Model<SkillTypeAttributes, SkillTypeCreationAttributes>
    implements SkillTypeAttributes
{
    public id!: string;
    public description!: string;
}

SkillTypeModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: SEQUELIZE_CONFIG,
        modelName: 'SkillType',
        tableName: 'skill_type',
        timestamps: false,
    },
);

export const skillTypeModelSynced = SkillTypeModel.sync();
