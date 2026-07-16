import { Router } from "express";
import { authUser } from "../../common/middlewares/authUser.middleware";
import { requireRole } from "../../common/middlewares/requireRole.middleware";
import { ownerOrAdmin, restrictPrivilegedFields } from "../../common/middlewares/ownership.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { Role } from "../../common/enums/role.enum";
import {
    CreateUserSchema,
    UpdateUserSchema,
    GetOneUserSchema,
    GetAllUsersSchema,
    DeleteUserSchema,
} from "./schemas/user.schema";
import {
    getAllUsersController,
    getOneUserController,
    createUserController,
    updateUserController,
    deleteUserController,
} from "./user.controller";

export const userRouter = Router();

// Todas las rutas de /user requieren autenticación.
userRouter.use(authUser);

userRouter.get("/", requireRole(Role.ADMIN), validateSchema(GetAllUsersSchema), getAllUsersController);
userRouter.get("/:id", validateSchema(GetOneUserSchema), ownerOrAdmin(), getOneUserController);
userRouter.post("/", requireRole(Role.ADMIN), validateSchema(CreateUserSchema), createUserController);
userRouter.patch(
    "/:id",
    validateSchema(UpdateUserSchema),
    ownerOrAdmin(),
    restrictPrivilegedFields,
    updateUserController,
);
userRouter.delete("/:id", requireRole(Role.ADMIN), validateSchema(DeleteUserSchema), deleteUserController);
