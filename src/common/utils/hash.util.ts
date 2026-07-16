import { createHash, randomBytes } from "crypto";
import * as argon2 from "argon2";

/** Hash lento (argon2id) para contraseñas: resistente a fuerza bruta offline. */
export const hashPassword = (value: string): Promise<string> => {
    return argon2.hash(value, { type: argon2.argon2id });
};

export const compareHash = (value: string, hashedValue: string): Promise<boolean> => {
    return argon2.verify(hashedValue, value);
};

/**
 * Hash rápido y determinístico para tokens de alta entropía (refresh, reset,
 * verificación): permite buscar por hash en la BD sin guardar el token en claro.
 * NO usar para contraseñas (para eso está argon2).
 */
export const sha256 = (value: string): string => {
    return createHash("sha256").update(value).digest("hex");
};

/** Token opaco aleatorio de 256 bits (para enlaces de reset / verificación). */
export const generateSecureToken = (): string => {
    return randomBytes(32).toString("hex");
};
