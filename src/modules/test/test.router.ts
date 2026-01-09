import { Router } from "express";
import {
    getAllTestsController,
    getOneTestController,
    createTestController,
    updateTestController,
    deleteTestController,
} from "./test.controller";

export const testRouter = Router();

testRouter.get("/", getAllTestsController);
testRouter.get("/:id", getOneTestController);
testRouter.post("/", createTestController);
testRouter.patch("/:id", updateTestController);
testRouter.delete("/:id", deleteTestController);
