import { Repository } from "typeorm";
import { BadRequestException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";

export class CreateUserUseCase {
  private readonly userRepository: Repository<User>;

  async execute(user: User): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: user.email });
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }
    return this.userRepository.create(user);
  }
}
