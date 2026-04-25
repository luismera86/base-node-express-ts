import { Router } from "express";
import {
    getAllUsersController,
    getOneUserController,
    createUserController,
    updateUserController,
    deleteUserController,
} from "./user.controller";

export const userRouter = Router();

userRouter.get("/", getAllUsersController);
userRouter.get("/:id", getOneUserController);
userRouter.post("/", createUserController);
userRouter.patch("/:id", updateUserController);
userRouter.delete("/:id", deleteUserController);
