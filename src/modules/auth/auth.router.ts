import { Router } from "express";
import { AuthController } from "./auth.controller";
import { PassportMiddleware } from "../../common/middlewares/passport.middleware";

export class AuthRouter {
    static get router() {
        const router = Router();
        const authController = new AuthController();
        router.post("/register", authController.register);
        router.post("/login", PassportMiddleware.passportCall("login"), authController.login);
        return router;
    }
}
