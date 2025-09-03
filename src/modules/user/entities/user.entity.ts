import { Column } from "typeorm";
import { Entity } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserSchema } from "../schemas/user.schema";

@Entity()
export class User extends BaseEntity implements Partial<UserSchema> {
    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
}
