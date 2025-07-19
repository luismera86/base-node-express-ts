import { Router } from "express";
import { UserController } from "./user.controller";

export class UserRouter {
    static get router() {
        const router = Router();
        const controller = new UserController();

        router.get("/", controller.getAllUsers);
        router.get("/:id", controller.getOneUser);
        router.post("/", controller.createUser);
        router.patch("/:id", controller.updateUser);
        router.delete("/:id", controller.deleteUser);

        return router;
    }
}
