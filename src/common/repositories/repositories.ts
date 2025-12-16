import AppDataSource from "../../config/datasource.config";

import { User } from "../../modules/user/entities/user.entity";

export const userRepository = AppDataSource.getRepository(User);
