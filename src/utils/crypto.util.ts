import bcrypt from "bcrypt";

const saltRounds = 10;

export const hash = async (plainText: string) => {
    const salt = await bcrypt.genSalt(saltRounds);

    const hash = await bcrypt.hash(plainText, salt);

    return hash;
};

export const verifyHash = async (plainText: string, hash: string) => {
    return await bcrypt.compare(plainText, hash);
};
