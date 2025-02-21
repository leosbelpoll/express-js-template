import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import {
    ExpressMiddlewareInterface,
    UnauthorizedError,
} from "routing-controllers";
import { JwtUser } from "../dtos/jwt-user.dto";

export class AuthMiddleware implements ExpressMiddlewareInterface {
    use(request: Request, _response: Response, next: NextFunction): any {
        const { headers } = request;

        const { authorization } = headers;

        if (!authorization) {
            throw new UnauthorizedError();
        }

        const [_, token] = authorization.split(" ");

        const secretKey = process.env.SECRET_KEY || "secret";

        jwt.verify(token, secretKey, (error, payload) => {
            if (error) {
                throw new UnauthorizedError("Invalid token");
            }

            request.user = payload as JwtUser;

            next();
        });
    }
}
