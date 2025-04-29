import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import AppDataSource from "../../config/datasource.config";
export class UserRepository {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    console.log(users);
    return users;
  }
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  
}