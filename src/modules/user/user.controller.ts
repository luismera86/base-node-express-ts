import { Request, Response, NextFunction } from "express";
import { GetAllUsersUseCase } from "./use-cases/get-all.use-case";
import { GetOneUserUseCase } from "./use-cases/get-one.use-case";
import { CreateUserUseCase } from "./use-cases/create-user.use-case";

export class UserController {
  private readonly getAllUsersUseCase: GetAllUsersUseCase;
  private readonly getOneUserUseCase: GetOneUserUseCase;
  private readonly createUserUseCase: CreateUserUseCase;
  constructor() {
    this.getAllUsersUseCase = new GetAllUsersUseCase();
    this.getOneUserUseCase = new GetOneUserUseCase();
    this.createUserUseCase = new CreateUserUseCase();
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getOneUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const user = await this.getOneUserUseCase.execute(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
