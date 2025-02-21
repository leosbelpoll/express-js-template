import { Request } from "express";

import { JwtUser } from "../dtos/jwt-user.dto";

declare module "express" {
    interface Request {
        user?: JwtUser;
    }
}
