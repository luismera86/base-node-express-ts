import { Router } from "express";
import { UserRouter } from "../../modules/user/user.router";

export class BaseRouter {
  static router() {
    const router = Router();

    router.use("/users", UserRouter.router);
    return router;
  }
}
