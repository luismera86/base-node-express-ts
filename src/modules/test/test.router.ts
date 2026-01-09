import { Router } from "express";
import {
    getAllTestsController,
    getOneTestController,
    createTestController,
    updateTestController,
    deleteTestController,
} from "./test.controller";

export const createTestRouter = (): Router => {
    const router = Router();

    router.get("/", getAllTestsController);
    router.get("/:id", getOneTestController);
    router.post("/", createTestController);
    router.patch("/:id", updateTestController);
    router.delete("/:id", deleteTestController);

    return router;
};
