import { Router } from "express";
import { passportCall } from "../../common/middlewares/passport.middleware";
import { AuthController } from "./auth.controller";

export class AuthRouter {
    static get router() {
        const router = Router();
        const authController = new AuthController();
        router.post("/register", authController.register);
        router.post("/login", passportCall("login"), authController.login);
        return router;
    }
}
