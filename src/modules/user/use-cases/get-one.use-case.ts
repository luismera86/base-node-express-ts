import { User } from "../entities/user.entity";
import { UserRepository } from "../user.repository";

export class GetOneUserUseCase {
  private readonly userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}