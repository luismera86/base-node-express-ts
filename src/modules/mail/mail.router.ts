import { Router } from "express";
import { authUser } from "../../common/middlewares/authUser.middleware";
import { requireRole } from "../../common/middlewares/requireRole.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { Role } from "../../common/enums/role.enum";
import { SendTestMailSchema, SendAllTestMailsSchema } from "./schemas/mail.schema";
import { sendTestMailController, sendAllTestMailsController } from "./mail.controller";

export const mailRouter = Router();

// Endpoints de prueba de templates: solo ADMIN (envían correos reales).
mailRouter.use(authUser, requireRole(Role.ADMIN));

mailRouter.post("/test", validateSchema(SendTestMailSchema), sendTestMailController);
mailRouter.post("/test/all", validateSchema(SendAllTestMailsSchema), sendAllTestMailsController);
