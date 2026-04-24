import { SEQUELIZE_CONFIG } from "@shared/infrastructure/database/sequelize/config";
import { DataTypes, Model } from "sequelize";
import { InstanceModel, instanceModelSynced } from "./instance.model";
import { PlayerModel } from "@player/infrastructure/database/sequelize/models/player.model";

export interface InstanceParticipantAttributes {
    instance_id: string;
    player_id: string;
}

export class InstanceParticipantsModel extends Model<InstanceParticipantAttributes>
    implements InstanceParticipantAttributes
{
    public instance_id!: string;
    public player_id!: string;
}

InstanceParticipantsModel.init(
    {
        instance_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: { model: InstanceModel, key: "id" },
        },
        player_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: { model: PlayerModel, key: "id" },
        },
    },
    {
        sequelize: SEQUELIZE_CONFIG,
        modelName: "InstanceParticipant",
        timestamps: false,
    },
);

InstanceModel.hasMany(InstanceParticipantsModel, {
    foreignKey: "instance_id",
    as: "instanceParticipants",
});
InstanceParticipantsModel.belongsTo(InstanceModel, { foreignKey: "instance_id" });
InstanceParticipantsModel.belongsTo(PlayerModel, { foreignKey: "player_id" });
InstanceModel.belongsTo(PlayerModel, { foreignKey: "player_id", as: "creator" });

export const instanceParticipantsModelSynced = instanceModelSynced.then(
    () => InstanceParticipantsModel.sync(),
);
