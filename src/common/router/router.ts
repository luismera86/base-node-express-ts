import { authUser } from "../middlewares/authUser.middleware";
import { Router } from "express";
import { UserRouter } from "../../modules/user/user.router";
export class BaseRouter {
    static get router() {
        const router = Router();

        router.use(authUser);
        router.use("/user", UserRouter.router);
        return router;
    }
}
