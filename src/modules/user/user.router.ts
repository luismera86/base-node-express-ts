import { Router } from "express";
import { UserController } from "./user.controller";
import { SchemaValidator } from "../../common/middlewares/validateSchema.middleware";
import { CreateUserSchema } from "./schemas/user.schema";

export class UserRouter {
  static router() {
    const userController = new UserController();
    const router = Router();
    router.get("/", userController.getAllUsers);
    router.get("/:id", userController.getOneUser);
    router.post("/", SchemaValidator.validateSchema(CreateUserSchema), userController.createUser);
    return router;
  }
}
