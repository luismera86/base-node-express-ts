import { Column, Entity } from "typeorm";
import { BaseUUIDEntity } from "../../common/entities/baseUUID.entity";

@Entity()
export class User extends BaseUUIDEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;
}
