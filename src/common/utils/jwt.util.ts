import jwt from "jsonwebtoken";
import envConfig from "../../config/env.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

export class Jwt {
    static createToken(payload: any) {
        return jwt.sign(payload, envConfig.JWT_SECRET, {
            expiresIn: "365d",
        });
    }

    static verifyToken(token: string) {
        try {
            return jwt.verify(token, envConfig.JWT_SECRET) as { id: string; email: string };
        } catch (error) {
            throw new UnauthorizedException("Invalid token");
        }
    }
}
