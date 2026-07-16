import nodemailer, { Transporter } from "nodemailer";
import envConfig from "../../../config/env.config";
import { LoggerService } from "../../../common/utils/logger.util";

const logger = new LoggerService("Mailer");

export interface MailContent {
    subject: string;
    html: string;
    text: string;
}

/**
 * Sin MAIL_HOST configurado no hay transporte: el correo se escribe en los logs
 * en vez de enviarse — la app arranca sin SMTP en desarrollo; en producción se
 * configuran las variables MAIL_*.
 */
const transporter: Transporter | null = envConfig.MAIL_HOST
    ? nodemailer.createTransport({
          host: envConfig.MAIL_HOST,
          port: envConfig.MAIL_PORT,
          secure: envConfig.MAIL_SECURE,
          auth: envConfig.MAIL_USER ? { user: envConfig.MAIL_USER, pass: envConfig.MAIL_PASSWORD } : undefined,
      })
    : null;

export const sendMail = async (to: string, content: MailContent): Promise<void> => {
    if (!transporter) {
        logger.info(`[log-only] Mail para ${to}: "${content.subject}"`, content.text);
        return;
    }

    await transporter.sendMail({
        from: envConfig.MAIL_FROM,
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
    });
    logger.info(`Mail enviado a ${to}: "${content.subject}"`);
};
