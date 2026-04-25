import { SignJWT, jwtVerify } from "jose";
import envConfig from "../../config/env.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

const secret = new TextEncoder().encode(envConfig.JWT_SECRET);

export const createToken = async (payload: Record<string, unknown>): Promise<string> => {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("365d")
        .sign(secret);
};

export const verifyToken = async (token: string): Promise<{ id: string; email: string; role: string }> => {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as { id: string; email: string; role: string };
    } catch {
        throw new UnauthorizedException("Token inválido o expirado");
    }
};
