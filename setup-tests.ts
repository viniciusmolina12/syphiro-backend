import 'reflect-metadata';
import { register } from 'tsconfig-paths';
import { compilerOptions } from './tsconfig.json';
register({
    baseUrl: './src',
    paths: compilerOptions.paths
});
import { PlayerModel } from "./src/player/infrastructure/database/sequelize/models/player.model";
import { InstanceModel } from "./src/instance/infrastructure/database/sequelize/models/instance.model";
import { SkillModel } from "./src/skill/infrastructure/database/sequelize/models/skill.model";
import { SkillTypeModel } from "./src/skill/infrastructure/database/sequelize/models/skill-type.model";
import { InstanceParticipantsModel } from "./src/instance/infrastructure/database/sequelize/models/instance-participants.model";
import { SEQUELIZE_CONFIG } from './src/@shared/infrastructure/database/sequelize/config';



export default async function setup() {
    try {   
    await SEQUELIZE_CONFIG.drop();
    await PlayerModel.sync({ force: true });
    await InstanceModel.sync({ force: true });
    await InstanceParticipantsModel.sync({ force: true });
    await SkillTypeModel.sync({ force: true });
    await SkillModel.sync({ force: true });
    console.log("Setup tests concluído");
    } catch (error) {
        console.error('Erro ao setup tests', error);
    }
}

