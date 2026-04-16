import path from 'path';
import { Sequelize } from 'sequelize';

export const SEQUELIZE_CONFIG = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../../../', 'syphiro.db'),
});
