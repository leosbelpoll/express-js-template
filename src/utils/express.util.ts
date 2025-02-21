import { Request } from "express";
import { JwtUser } from "../dtos/jwt-user.dto";

export const getUserFromRequest = (request: Request): JwtUser => {
    const { user } = request;

    if (!user) {
        throw new Error("Request does not have a user");
    }

    return user;
};
