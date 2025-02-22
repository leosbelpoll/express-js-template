import jwt from "jsonwebtoken";
import { container } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import {
    ExpressMiddlewareInterface,
    UnauthorizedError,
} from "routing-controllers";
import { JwtUser } from "../dtos/jwt-user.dto";
import { EnvService } from "../services/env.service";

export class AuthMiddleware implements ExpressMiddlewareInterface {
    private envService: EnvService;

    constructor() {
        this.envService = container.resolve(EnvService);
    }

    use(request: Request, _response: Response, next: NextFunction): any {
        const { headers } = request;

        const { authorization } = headers;

        if (!authorization) {
            throw new UnauthorizedError();
        }

        const [_, token] = authorization.split(" ");

        const accessTokenSecret = this.envService.getEnv("ACCESS_TOKEN_SECRET");

        jwt.verify(token, accessTokenSecret, (error, payload) => {
            if (error) {
                throw new UnauthorizedError("Invalid token");
            }

            request.user = payload as JwtUser;

            next();
        });
    }
}
