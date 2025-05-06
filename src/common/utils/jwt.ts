import jwt from "jsonwebtoken";
import envConfig from "../../config/env.config";

export class Jwt {
  static async sign(payload: any) {
    return jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  static async verify(token: string) {
    return jwt.verify(token, envConfig.JWT_SECRET);
  }
}
