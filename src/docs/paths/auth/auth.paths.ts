import { BasePath } from "../base.path";
import { RegisterPath } from "./register.path";
import { LoginPath } from "./login.path";
import { ForgotPasswordPath } from "./forgot-password.path";
import { ResetPasswordPath } from "./reset-password.path";
import { registry } from "../../swagger";

export class AuthPaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new RegisterPath(this.registry).register();
        new LoginPath(this.registry).register();
        new ForgotPasswordPath(this.registry).register();
        new ResetPasswordPath(this.registry).register();
    }
}
