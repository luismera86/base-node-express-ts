import { LoggerService } from "../../../common/utils/logger.util";
import { Lang } from "../../../common/i18n/i18n.util";
import { MailTemplate } from "../../../common/enums/mail-template.enum";
import { sendMail } from "../utils/mailer.util";
import { templatePreviews } from "../templates/template-previews";
import { SendAllTestMailsDto } from "../schemas/mail.schema";

const logger = new LoggerService("SendAllTestMailsUseCase");

/** Envía TODOS los templates con datos fake a una casilla real para validarlos de una vez. */
export const sendAllTestMails = async (
    data: SendAllTestMailsDto,
    lang: Lang,
): Promise<{ to: string; templates: MailTemplate[] }> => {
    try {
        const templates = Object.keys(templatePreviews) as MailTemplate[];

        for (const template of templates) {
            await sendMail(data.to, templatePreviews[template](lang));
        }

        return { to: data.to, templates };
    } catch (error: unknown) {
        logger.error("Error sending all test mails", (error as Error).message);
        throw error;
    }
};
