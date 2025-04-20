import { User } from "../entities/user.entity";
import { UserRepository } from "../user.repository";

export class GetAllUsersUseCase {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}