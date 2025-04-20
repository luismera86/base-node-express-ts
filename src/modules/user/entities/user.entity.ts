import { Column } from "typeorm";
import { Entity } from "typeorm";
import { BaseUUIDEntity } from "../../../common/entities/baseUUID.entity";
import { UserSchema } from "../schemas/user.schema";

@Entity()
export class User extends BaseUUIDEntity implements UserSchema {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

}