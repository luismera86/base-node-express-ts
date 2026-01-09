import { Request, Response, NextFunction } from "express";
import { getAllTest2s } from "./use-cases/get-all-test2.use-case";
import { getOneTest2 } from "./use-cases/get-one-test2.use-case";
import { createTest2 } from "./use-cases/create-test2.use-case";
import { updateTest2 } from "./use-cases/update-test2.use-case";
import { deleteTest2 } from "./use-cases/delete-test2.use-case";
import { UpdateTest2Dto } from "./schemas/test2.schema";

export const getAllTest2sController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const test2s = await getAllTest2s();
        res.json(test2s);
    } catch (error) {
        next(error);
    }
};

export const getOneTest2Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const test2 = await getOneTest2(+id);
        res.status(200).json(test2);
    } catch (error) {
        next(error);
    }
};

export const createTest2Controller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const test2 = await createTest2(req.body);
        res.status(201).json(test2);
    } catch (error) {
        next(error);
    }
};

export const updateTest2Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const test2 = await updateTest2(+id, req.body as UpdateTest2Dto);
        res.status(200).json(test2);
    } catch (error) {
        next(error);
    }
};

export const deleteTest2Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await deleteTest2(+id);
        res.status(200).json({ status: "ok", message: "Successfully deleted Test2" });
    } catch (error) {
        next(error);
    }
};
