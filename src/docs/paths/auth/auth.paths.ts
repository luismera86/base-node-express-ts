import { registry } from "../../swagger";
import { BasePath } from "../base.path";

import { LoginPath } from "./login.path";
import { RegisterPath } from "./register.phat";

export class AuthPaths extends BasePath {
    constructor() {
        super(registry);
    }
    register(): void {
        new LoginPath(this.registry).register();
        new RegisterPath(this.registry).register();
    }
}
