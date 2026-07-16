import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { MailTemplate } from "../../../common/enums/mail-template.enum";

extendZodWithOpenApi(z);

export const SendTestMailSchema = {
    body: z
        .object({
            to: z.string().email().openapi({ example: "juan@example.com", description: "Casilla destino" }),
            template: z
                .enum(MailTemplate)
                .openapi({ example: MailTemplate.VERIFY_EMAIL, description: "Template a enviar con datos fake" }),
        })
        .openapi("SendTestMail"),
};

export const SendAllTestMailsSchema = {
    body: z
        .object({
            to: z.string().email().openapi({ example: "juan@example.com", description: "Casilla destino" }),
        })
        .openapi("SendAllTestMails"),
};

export type SendTestMailDto = z.infer<typeof SendTestMailSchema.body>;
export type SendAllTestMailsDto = z.infer<typeof SendAllTestMailsSchema.body>;
