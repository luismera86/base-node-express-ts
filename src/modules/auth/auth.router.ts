import { Router } from "express";
import { passportCall } from "../../common/middlewares/passport.middleware";
import { registerController, loginController } from "./auth.controller";

export const createAuthRouter = (): Router => {
    const router = Router();
    router.post("/register", registerController);
    router.post("/login", passportCall("login"), loginController);
    return router;
};
