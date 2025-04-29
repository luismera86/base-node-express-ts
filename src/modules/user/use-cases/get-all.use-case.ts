import { Repository } from "typeorm";
import { LoggerService } from "../../../common/utils/logger";
import AppDataSource from "../../../config/datasource.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";

export class GetAllUsersUseCase {
  private readonly userRepository: Repository<User>;
  private readonly logger: LoggerService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.logger = new LoggerService("GetAllUsersUseCase");
  }

  async execute(): Promise<User[]> {
    const users = await this.userRepository.find();
    this.logger.info(`Found ${users.length} users`);
    
    if (users.length === 0) {
      throw new NotFoundException("Users not found");
    }
    
    return users;
  }
}
