import { NextFunction, Request, Response } from "express";
import passport from "../../config/passport/passport.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

export const passportCall = (strategy: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(strategy, (err: any, user: any, info: any) => {
            try {
                if (err) throw err;
                if (info) throw new UnauthorizedException(info.message);
                if (!user) throw new UnauthorizedException("Unauthorized");
                req.user = user;
                next();
            } catch (error) {
                next(error);
            }
        })(req, res, next);
    };
};
