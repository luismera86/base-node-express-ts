import { Lang } from "../../../common/i18n/i18n.util";
import { MailTemplate } from "../../../common/enums/mail-template.enum";
import { MailContent } from "../utils/mailer.util";
import { verifyEmailTemplate } from "./verify-email.template";
import { resetPasswordTemplate } from "./reset-password.template";

/**
 * Preview de cada template con datos fake, para validar el formato real del
 * correo en una casilla. Al crear un template nuevo: sumarlo a MailTemplate y
 * agregar aquí su preview para que quede cubierto por los endpoints de prueba.
 */
export const templatePreviews: Record<MailTemplate, (lang: Lang) => MailContent> = {
    [MailTemplate.VERIFY_EMAIL]: (lang) =>
        verifyEmailTemplate(lang, {
            name: "Juan Pérez",
            link: "https://example.com/verify-email?token=fake-token",
        }),
    [MailTemplate.RESET_PASSWORD]: (lang) =>
        resetPasswordTemplate(lang, {
            name: "Juan Pérez",
            link: "https://example.com/reset-password?token=fake-token",
            ttl: 30,
        }),
};
