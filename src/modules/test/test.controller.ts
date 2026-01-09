import { Request, Response, NextFunction } from "express";
import { getAllTests } from "./use-cases/get-all-test.use-case";
import { getOneTest } from "./use-cases/get-one-test.use-case";
import { createTest } from "./use-cases/create-test.use-case";
import { updateTest } from "./use-cases/update-test.use-case";
import { deleteTest } from "./use-cases/delete-test.use-case";
import { UpdateTestDto } from "./schemas/test.schema";

export const getAllTestsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tests = await getAllTests();
        res.json(tests);
    } catch (error) {
        next(error);
    }
};

export const getOneTestController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const test = await getOneTest(id);
        res.status(200).json(test);
    } catch (error) {
        next(error);
    }
};

export const createTestController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const test = await createTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        next(error);
    }
};

export const updateTestController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const test = await updateTest(+id, req.body as UpdateTestDto);
        res.status(200).json(test);
    } catch (error) {
        next(error);
    }
};

export const deleteTestController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await deleteTest(+id);
        res.status(200).json({ status: "ok", message: "Successfully deleted Test" });
    } catch (error) {
        next(error);
    }
};
