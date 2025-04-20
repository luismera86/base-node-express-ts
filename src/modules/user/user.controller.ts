import { Request, Response } from 'express';
import { GetAllUsersUseCase } from "./use-cases/get-all.use-case";
import { GetOneUserUseCase } from "./use-cases/get-one.use-case";

export class UserController {
  private readonly getAllUsersUseCase: GetAllUsersUseCase;
  private readonly getOneUserUseCase: GetOneUserUseCase;

  constructor(
   
  ) {
    this.getAllUsersUseCase = new GetAllUsersUseCase();
    this.getOneUserUseCase = new GetOneUserUseCase()
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await this.getAllUsersUseCase.execute();
    res.json(users);
  }

  async getOneUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.getOneUserUseCase.execute(id);
    res.json(user);
  }
}
