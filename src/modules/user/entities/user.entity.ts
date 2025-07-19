import { Column } from "typeorm";
import { Entity } from "typeorm";
import { BaseUUIDEntity } from "../../../common/entities/baseUUID.entity";
import { UserSchema } from "../schemas/user.schema";

@Entity()
export class User extends BaseUUIDEntity implements UserSchema {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column()
  email: string;
}
