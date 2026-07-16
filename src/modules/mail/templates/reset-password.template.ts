import { Lang, t } from "../../i18n/i18n.util";
import { MailContent } from "../mailer.util";
import { ctaButton, layout } from "./layout";

export const resetPasswordTemplate = (lang: Lang, params: { name: string; link: string; ttl: number }): MailContent => {
    const title = t("mail.RESET_TITLE", lang);
    const body = t("mail.RESET_BODY", lang, { name: params.name, ttl: params.ttl });
    const cta = t("mail.RESET_CTA", lang);
    const fallback = t("mail.FALLBACK", lang);

    return {
        subject: t("mail.RESET_SUBJECT", lang),
        html: layout(
            title,
            `<p style="color:#374151;line-height:1.6;">${body}</p>
             ${ctaButton(cta, params.link)}
             <p style="font-size:12px;color:#6b7280;">${fallback}<br/>
               <a href="${params.link}" style="color:#2563eb;word-break:break-all;">${params.link}</a></p>`,
        ),
        text: `${body}\n\n${params.link}`,
    };
};
