import { describe, it, expect, vi, beforeEach } from "vitest";
import { MailTemplate } from "../../common/enums/mail-template.enum";
import { templatePreviews } from "./templates/template-previews";
import { sendTestMail } from "./use-cases/send-test-mail.use-case";
import { sendAllTestMails } from "./use-cases/send-all-test-mails.use-case";
import { sendMail } from "./utils/mailer.util";

vi.mock("./utils/mailer.util", () => ({
    sendMail: vi.fn().mockResolvedValue(undefined),
}));

const sendMailMock = vi.mocked(sendMail);

describe("mail module", () => {
    beforeEach(() => {
        sendMailMock.mockClear();
    });

    it("cada template del enum tiene su preview con datos fake", () => {
        for (const template of Object.values(MailTemplate)) {
            const content = templatePreviews[template]("es");
            expect(content.subject).toBeTruthy();
            expect(content.html).toBeTruthy();
            expect(content.text).toBeTruthy();
        }
    });

    it("sendTestMail envía el template elegido a la casilla indicada", async () => {
        const result = await sendTestMail({ to: "qa@example.com", template: MailTemplate.VERIFY_EMAIL }, "es");

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const [to, content] = sendMailMock.mock.calls[0];
        expect(to).toBe("qa@example.com");
        expect(content.subject).toBe(templatePreviews[MailTemplate.VERIFY_EMAIL]("es").subject);
        expect(result).toEqual({ to: "qa@example.com", template: MailTemplate.VERIFY_EMAIL });
    });

    it("sendTestMail respeta el idioma pedido", async () => {
        await sendTestMail({ to: "qa@example.com", template: MailTemplate.RESET_PASSWORD }, "en");

        const [, content] = sendMailMock.mock.calls[0];
        expect(content.subject).toBe(templatePreviews[MailTemplate.RESET_PASSWORD]("en").subject);
    });

    it("sendAllTestMails envía todos los templates a la casilla indicada", async () => {
        const all = Object.values(MailTemplate);
        const result = await sendAllTestMails({ to: "qa@example.com" }, "es");

        expect(sendMailMock).toHaveBeenCalledTimes(all.length);
        for (const [to] of sendMailMock.mock.calls) {
            expect(to).toBe("qa@example.com");
        }
        expect(result).toEqual({ to: "qa@example.com", templates: all });
    });

    it("sendTestMail propaga el error si el envío falla", async () => {
        sendMailMock.mockRejectedValueOnce(new Error("smtp down"));

        await expect(sendTestMail({ to: "qa@example.com", template: MailTemplate.VERIFY_EMAIL }, "es")).rejects.toThrow(
            "smtp down",
        );
    });
});
