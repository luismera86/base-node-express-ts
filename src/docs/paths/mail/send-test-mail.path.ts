import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { BasePath } from "../base.path";
import { SendTestMailSchema } from "../../../modules/mail/schemas/mail.schema";
import { MailTemplate } from "../../../common/enums/mail-template.enum";

export class SendTestMailPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["mail"],
            method: "post",
            path: "/mail/test",
            summary: "Enviar un template de prueba",
            description:
                "Envía el template elegido con datos fake a una casilla real para validar el formato del correo. " +
                "El idioma del contenido se resuelve por `Accept-Language`. Solo ADMIN. " +
                "Sin `MAIL_HOST` configurado el correo se escribe en los logs (modo log-only).",
            request: {
                body: {
                    content: { "application/json": { schema: SendTestMailSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Correo de prueba enviado",
                    content: {
                        "application/json": {
                            schema: z.object({
                                to: z.string().openapi({ example: "juan@example.com" }),
                                template: z.enum(MailTemplate).openapi({ example: MailTemplate.VERIFY_EMAIL }),
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
