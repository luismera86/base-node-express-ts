import { Column } from "typeorm";
import { Entity } from "typeorm";
import { UserSchema } from "../schemas/user.schema";
import { BaseUUIDEntity } from "../../../common/entities/baseUUID.entity";

@Entity()
export class User extends BaseUUIDEntity implements Partial<UserSchema> {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    password: string;
}
