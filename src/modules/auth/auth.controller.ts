import { NextFunction, Request, Response } from "express";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/schemas/user.schema";
import { CreateUserUseCase } from "../user/use-cases/create-user.use-case";
import { createToken } from "../../common/utils/jwt.util";

export class AuthController {
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as CreateUserDto;
            const createUserUseCase = new CreateUserUseCase();
            const user = await createUserUseCase.execute(body);

            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as unknown as User;
            const token = createToken({ id: user.id, email: user.email });
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({ user: userWithoutPassword, token });
        } catch (error) {
            next(error);
        }
    };
}
