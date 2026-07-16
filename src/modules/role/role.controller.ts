import { Request, Response, NextFunction } from "express";
import { getAllRoles } from "./use-cases/get-all-role.use-case";
import { getOneRole } from "./use-cases/get-one-role.use-case";
import { createRole } from "./use-cases/create-role.use-case";
import { updateRole } from "./use-cases/update-role.use-case";
import { deleteRole } from "./use-cases/delete-role.use-case";
import { UpdateRoleDto } from "./schemas/role.schema";
import { PaginationQueryDto } from "../../common/schemas/pagination.schema";

export const getAllRolesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.query ya viene validado y con defaults por validateSchema(GetAllRolesSchema).
        const roles = await getAllRoles(req.query as unknown as PaginationQueryDto);
        res.json(roles);
    } catch (error) {
        next(error);
    }
};

export const getOneRoleController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const role = await getOneRole(id);
        res.status(200).json(role);
    } catch (error) {
        next(error);
    }
};

export const createRoleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = await createRole(req.body);
        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
};

export const updateRoleController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const role = await updateRole(id, req.body as UpdateRoleDto);
        res.status(200).json(role);
    } catch (error) {
        next(error);
    }
};

export const deleteRoleController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await deleteRole(id);
        res.status(200).json({ status: "ok", message: "Successfully deleted Role" });
    } catch (error) {
        next(error);
    }
};
