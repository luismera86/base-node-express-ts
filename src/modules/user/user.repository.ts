import { Repository } from "typeorm";
import { BaseRepository } from "../../common/repositories/base.repository";
import { User } from "./entities/user.entity";
import AppDataSource from "../../config/datasource.config";
export class UserRepository extends BaseRepository<User> {
  private readonly userRepository: Repository<User>;

  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}