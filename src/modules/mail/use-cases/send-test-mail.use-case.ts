import { LoggerService } from "../../../common/utils/logger.util";
import { Lang } from "../../../common/i18n/i18n.util";
import { MailTemplate } from "../../../common/enums/mail-template.enum";
import { sendMail } from "../utils/mailer.util";
import { templatePreviews } from "../templates/template-previews";
import { SendTestMailDto } from "../schemas/mail.schema";

const logger = new LoggerService("SendTestMailUseCase");

/** Envía el template elegido con datos fake a una casilla real para validar su formato. */
export const sendTestMail = async (
    data: SendTestMailDto,
    lang: Lang,
): Promise<{ to: string; template: MailTemplate }> => {
    try {
        const content = templatePreviews[data.template](lang);
        await sendMail(data.to, content);

        return { to: data.to, template: data.template };
    } catch (error: unknown) {
        logger.error("Error sending test mail", (error as Error).message);
        throw error;
    }
};
