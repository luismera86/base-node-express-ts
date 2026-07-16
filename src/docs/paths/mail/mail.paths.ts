import { BasePath } from "../base.path";
import { SendTestMailPath } from "./send-test-mail.path";
import { SendAllTestMailsPath } from "./send-all-test-mails.path";
import { registry } from "../../swagger";

export class MailPaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new SendTestMailPath(this.registry).register();
        new SendAllTestMailsPath(this.registry).register();
    }
}
