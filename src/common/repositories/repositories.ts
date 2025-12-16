import AppDataSource from "../../config/datasource.config";

import { User } from "../../modules/user/entities/user.entity";

import { Test } from "../../modules/test/entities/test.entity";
import { Prueba } from "../../modules/prueba/entities/prueba.entity";
export const userRepository = AppDataSource.getRepository(User);

export const testRepository = AppDataSource.getRepository(Test);

export const pruebaRepository = AppDataSource.getRepository(Prueba);
