import { NextFunction, Request, Response } from "express";
import { resolveLang } from "../i18n/i18n.util";

/**
 * Resuelve el idioma del request desde `Accept-Language` (es | en, default es)
 * y lo deja en `req.lang` para que el error handler traduzca los mensajes.
 */
export const languageResolver = (req: Request, _res: Response, next: NextFunction) => {
    req.lang = resolveLang(req.headers["accept-language"]);
    next();
};
