import { Router } from "express";
import {
    getAllTest2sController,
    getOneTest2Controller,
    createTest2Controller,
    updateTest2Controller,
    deleteTest2Controller,
} from "./test2.controller";

export const test2Router = Router();

test2Router.get("/", getAllTest2sController);
test2Router.get("/:id", getOneTest2Controller);
test2Router.post("/", createTest2Controller);
test2Router.patch("/:id", updateTest2Controller);
test2Router.delete("/:id", deleteTest2Controller);
