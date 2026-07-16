import { Router } from "express";
import { authUser } from "../../common/middlewares/authUser.middleware";
import { requireRole } from "../../common/middlewares/requireRole.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { Role } from "../../common/enums/role.enum";
import {
    CreateRoleSchema,
    UpdateRoleSchema,
    GetOneRoleSchema,
    GetAllRolesSchema,
    DeleteRoleSchema,
} from "./schemas/role.schema";
import {
    getAllRolesController,
    getOneRoleController,
    createRoleController,
    updateRoleController,
    deleteRoleController,
} from "./role.controller";

export const roleRouter = Router();

// La administración de roles es exclusiva de ADMIN.
roleRouter.use(authUser, requireRole(Role.ADMIN));

roleRouter.get("/", validateSchema(GetAllRolesSchema), getAllRolesController);
roleRouter.get("/:id", validateSchema(GetOneRoleSchema), getOneRoleController);
roleRouter.post("/", validateSchema(CreateRoleSchema), createRoleController);
roleRouter.patch("/:id", validateSchema(UpdateRoleSchema), updateRoleController);
roleRouter.delete("/:id", validateSchema(DeleteRoleSchema), deleteRoleController);
