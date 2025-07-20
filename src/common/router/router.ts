import { AuthRouter } from "../../modules/auth/auth.router";
import { authUser } from "../middlewares/authUser.middleware";
import { Router } from "express";
import { UserRouter } from "../../modules/user/user.router";
export class BaseRouter {
    static get router() {
        const router = Router();

        router.use("/auth", AuthRouter.router);
        router.use("/user", UserRouter.router);
        router.use(authUser);
        return router;
    }
}
