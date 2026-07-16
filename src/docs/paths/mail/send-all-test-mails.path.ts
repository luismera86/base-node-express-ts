import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { BasePath } from "../base.path";
import { SendAllTestMailsSchema } from "../../../modules/mail/schemas/mail.schema";
import { MailTemplate } from "../../../common/enums/mail-template.enum";

export class SendAllTestMailsPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["mail"],
            method: "post",
            path: "/mail/test/all",
            summary: "Enviar todos los templates de prueba",
            description:
                "Envía TODOS los templates con datos fake a una casilla real para validarlos de una vez. " +
                "El idioma del contenido se resuelve por `Accept-Language`. Solo ADMIN. " +
                "Sin `MAIL_HOST` configurado los correos se escriben en los logs (modo log-only).",
            request: {
                body: {
                    content: { "application/json": { schema: SendAllTestMailsSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Correos de prueba enviados",
                    content: {
                        "application/json": {
                            schema: z.object({
                                to: z.string().openapi({ example: "juan@example.com" }),
                                templates: z
                                    .array(z.enum(MailTemplate))
                                    .openapi({ example: Object.values(MailTemplate) }),
                            }),
                        },
                    },
                },
                401: { description: "No autenticado" },
                403: { description: "Requiere rol ADMIN" },
            },
        });
    }
}
