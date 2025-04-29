import { CLIENT_RENEG_LIMIT } from "tls";
import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { UserRepository } from "../user.repository";
import { LoggerService } from "../../../common/utils/logger";

export class GetAllUsersUseCase {
  private readonly userRepository: UserRepository;
  private readonly logger: LoggerService;

  constructor() {
    this.userRepository = new UserRepository();
    this.logger = new LoggerService("GetAllUsersUseCase");
  }

  async execute(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    this.logger.info(`Found ${users.length} users`);
    if (!users) {
      throw new NotFoundException("Users not found");
    }
    return users;
  }
}