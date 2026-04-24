import 'reflect-metadata';
import { PlayerModel } from "./src/player/infrastructure/database/sequelize/models/player.model";
import { InstanceModel } from "./src/instance/infrastructure/database/sequelize/models/instance.model";
import { InstanceParticipantsModel } from "./src/instance/infrastructure/database/sequelize/models/instance-participants.model";

PlayerModel.sync({ force: true });
InstanceModel.sync({ force: true });
InstanceParticipantsModel.sync({ force: true });                                                        