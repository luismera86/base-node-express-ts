import { Router } from "express";
import {
    getAllUsersController,
    getOneUserController,
    createUserController,
    updateUserController,
    deleteUserController,
} from "./user.controller";

export const createUserRouter = (): Router => {
    const router = Router();

    router.get("/", getAllUsersController);
    router.get("/:id", getOneUserController);
    router.post("/", createUserController);
    router.patch("/:id", updateUserController);
    router.delete("/:id", deleteUserController);

    return router;
};
