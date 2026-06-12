import * as argon2 from "argon2";

export const hashearContrasena = (valor: string): Promise<string> => {
    return argon2.hash(valor, { type: argon2.argon2id });
};

export const compararHash = (valor: string, valorHasheado: string): Promise<boolean> => {
    return argon2.verify(valorHasheado, valor);
};
