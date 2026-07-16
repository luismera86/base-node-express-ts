import { Request, Response, NextFunction } from "express";
import { sendTestMail } from "./use-cases/send-test-mail.use-case";
import { sendAllTestMails } from "./use-cases/send-all-test-mails.use-case";
import { DEFAULT_LANG } from "../../common/i18n/i18n.util";

export const sendTestMailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await sendTestMail(req.body, req.lang ?? DEFAULT_LANG);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const sendAllTestMailsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await sendAllTestMails(req.body, req.lang ?? DEFAULT_LANG);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
