import { IInstanceRepository } from "@instance/domain/repositories/instance.repository";
import { Instance, InstanceId, InstanceStatus } from "@instance/domain/instance.aggregate";
import { PlayerId } from "@player/domain/player.aggregate";
import { InstanceModel } from "../models/instance.model";
import { InstanceParticipantsModel } from "../models/instance-participants.model";
import { InstanceModelMapper } from "./instance-model.mapper";
import { Op } from "sequelize";

const ACTIVE_STATUSES = [InstanceStatus.PENDING, InstanceStatus.RUNNING];

const WITH_PARTICIPANTS = {
    include: [{ model: InstanceParticipantsModel, as: "instanceParticipants" }],
};

export class InstanceSequelizeRepository implements IInstanceRepository {

    async findById(id: InstanceId): Promise<Instance | null> {
        const model = await InstanceModel.findOne({
            where: { id: id.toString() },
            ...WITH_PARTICIPANTS,
        });
        if (!model) return null;
        return InstanceModelMapper.toDomain(model);
    }

    async existsById(id: InstanceId): Promise<boolean> {
        const model = await InstanceModel.findOne({ where: { id: id.toString() } });
        return !!model;
    }

    async findActiveByPlayerId(player_id: PlayerId): Promise<Instance | null> {
        const participation = await InstanceParticipantsModel.findOne({
            where: { player_id: player_id.toString() },
            include: [{
                model: InstanceModel,
                where: { status: { [Op.in]: ACTIVE_STATUSES } },
                required: true,
            }],
        });

        if (!participation) return null;

        const model = await InstanceModel.findOne({
            where: { id: participation.instance_id },
            ...WITH_PARTICIPANTS,
        });

        return InstanceModelMapper.toDomain(model!);
    }

    async save(instance: Instance): Promise<void> {
        try {
        await InstanceModel.create({
            id: instance.id.toString(),
            player_id: instance.player_id.toString(),
            status: instance.status,
            difficulty: instance.difficulty,
            campaign_chapter_floor_id: instance.campaign_chapter_floor_id.toString(),
            started_at: instance.started_at,
        });
        } catch (error) {
            console.log('ERRO AO SALVAR A INSTANCIA',error);
        }
        await InstanceParticipantsModel.bulkCreate(
            [...instance.participants].map(p => ({
                instance_id: instance.id.toString(),
                player_id: p.toString(),
            })),
        );
    }

    async update(instance: Instance): Promise<void> {
        await InstanceModel.update(
            {
                status: instance.status,
                campaign_chapter_floor_id: instance.campaign_chapter_floor_id.toString(),
            },
            { where: { id: instance.id.toString() } },
        );

        await InstanceParticipantsModel.destroy({ where: { instance_id: instance.id.toString() } });
        await InstanceParticipantsModel.bulkCreate(
            [...instance.participants].map(p => ({
                instance_id: instance.id.toString(),
                player_id: p.toString(),
            })),
        );
    }
}
