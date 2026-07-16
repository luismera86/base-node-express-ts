import { Request, Response, NextFunction } from "express";
import { getAllUsers } from "./use-cases/get-all-user.use-case";
import { getOneUser } from "./use-cases/get-one-user.use-case";
import { createUser } from "./use-cases/create-user.use-case";
import { updateUser } from "./use-cases/update-user.use-case";
import { deleteUser } from "./use-cases/delete-user.use-case";
import { UpdateUserDto } from "./schemas/user.schema";
import { PaginationQueryDto } from "../../common/schemas/pagination.schema";

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.query ya viene validado y con defaults por validateSchema(GetAllUsersSchema).
        const users = await getAllUsers(req.query as unknown as PaginationQueryDto);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getOneUserController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const user = await getOneUser(id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const user = await updateUser(id, req.body as UpdateUserDto);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.status(200).json({ status: "ok", message: "Successfully deleted User" });
    } catch (error) {
        next(error);
    }
};
