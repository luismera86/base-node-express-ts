import * as argon2 from "argon2";

export const hashPassword = (value: string): Promise<string> => {
    return argon2.hash(value, { type: argon2.argon2id });
};

export const compareHash = (value: string, hashedValue: string): Promise<boolean> => {
    return argon2.verify(hashedValue, value);
};
