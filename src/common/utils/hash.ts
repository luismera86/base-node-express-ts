import bcrypt from "bcrypt";

export class Hash {
  static async hash(value: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(value, salt);
  }

  static async compare(value: string, hashedValue: string) {
    return bcrypt.compare(value, hashedValue);
  }
}
