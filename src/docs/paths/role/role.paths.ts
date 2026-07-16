import { BasePath } from "../base.path";
import { CreateRolePath } from "./create.path";
import { GetAllRolesPath } from "./get-all.path";
import { GetRoleByIdPath } from "./get-by-id.path";
import { UpdateRolePath } from "./update.path";
import { DeleteRolePath } from "./delete.path";
import { registry } from "../../swagger";

export class RolePaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new CreateRolePath(this.registry).register();
        new GetAllRolesPath(this.registry).register();
        new GetRoleByIdPath(this.registry).register();
        new UpdateRolePath(this.registry).register();
        new DeleteRolePath(this.registry).register();
    }
}
