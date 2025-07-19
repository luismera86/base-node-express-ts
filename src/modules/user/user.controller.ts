import { Request, Response, NextFunction } from "express";
import { GetAllUserUseCase } from "./use-cases/get-all-user.use-case";
import { GetOneUserUseCase } from "./use-cases/get-one-user.use-case";
import { CreateUserUseCase } from "./use-cases/create-user.use-case";
import { UpdateUserUseCase } from "./use-cases/update-user.use-case";
import { DeleteUserUseCase } from "./use-cases/delete-user.use-case";
import { UpdateUserDto } from "./schemas/user.schema";

export class UserController {
    constructor() {}

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const getAllUserUseCase = new GetAllUserUseCase();
            const users = await getAllUserUseCase.execute();
            res.json(users);
        } catch (error) {
            next(error);
        }
    };

    getOneUser = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const getOneUserUseCase = new GetOneUserUseCase();
            const user = await getOneUserUseCase.execute(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const createUserUseCase = new CreateUserUseCase();
            const user = await createUserUseCase.execute(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const updateUserUseCase = new UpdateUserUseCase();
            const user = await updateUserUseCase.execute(+id, req.body as UpdateUserDto);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const deleteUserUseCase = new DeleteUserUseCase();
            await deleteUserUseCase.execute(+id);
            res.status(200).json({ status: "ok", message: "Successfully deleted User" });
        } catch (error) {
            next(error);
        }
    };
}
