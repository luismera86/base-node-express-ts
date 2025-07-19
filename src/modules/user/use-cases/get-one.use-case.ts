import { User } from "../entities/user.entity";
import AppDataSource from "../../../config/datasource.config";
import { Repository } from "typeorm";
import { NotFoundException } from "../../../exceptions/exceptions";

export class GetOneUserUseCase {
  private readonly userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async execute(id: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
