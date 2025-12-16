import { NextFunction, Request, Response } from "express";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/schemas/user.schema";
import { createUser } from "../user/use-cases/create-user.use-case";
import { createToken } from "../../common/utils/jwt.util";

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body = req.body as CreateUserDto;
        const user = await createUser(body);

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as unknown as User;
        const token = createToken({ id: user.id, email: user.email });
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        next(error);
    }
};
