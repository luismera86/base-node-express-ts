import bcrypt from "bcrypt";

export const hashPassword = (value: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(value, salt);
};

export const compareHash = (value: string, hashedValue: string) => {
    return bcrypt.compareSync(value, hashedValue);
};
