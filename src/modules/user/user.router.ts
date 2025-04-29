import { Router } from "express";
import { UserController } from "./user.controller";

export class UserRouter {
  static router() {
    const userController = new UserController();
    const router = Router();
    router.get('/', userController.getAllUsers);
    router.get('/:id', userController.getOneUser);
    router.post('/', userController.createUser);
    return router;
  }
}
