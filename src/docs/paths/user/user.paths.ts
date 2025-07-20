
import { BasePath } from "../base.path";
import { CreateUserPath } from "./create.path";
import { GetAllUsersPath } from "./get-all.path";
import { GetUserByIdPath } from "./get-by-id.path";
import { UpdateUserPath } from "./update.path";
import { DeleteUserPath } from "./delete.path";
import { registry } from "../../swagger";

export class UserPaths extends BasePath {
  constructor() {
    super(registry);
  }

  register(): void {
    new CreateUserPath(this.registry).register();
    new GetAllUsersPath(this.registry).register();
    new GetUserByIdPath(this.registry).register();
    new UpdateUserPath(this.registry).register();
    new DeleteUserPath(this.registry).register();
  }
}
