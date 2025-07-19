import bcrypt from "bcrypt";

export class Hash {
  static hash(value: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(value, salt);
  }

  static compare(value: string, hashedValue: string) {
    return bcrypt.compareSync(value, hashedValue);
  }
}
