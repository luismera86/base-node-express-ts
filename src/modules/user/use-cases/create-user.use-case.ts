import { BadRequestException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { UserRepository } from "../user.repository";

export class CreateUserUseCase {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(user: User): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }
    return this.userRepository.create(user);
  }
}
