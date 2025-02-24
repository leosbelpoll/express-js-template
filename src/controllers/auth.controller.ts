import {
    JsonController,
    Post,
    Body,
    BadRequestError,
    InternalServerError,
    HttpCode,
    Res,
    CookieParam,
    UnauthorizedError,
    ForbiddenError,
} from "routing-controllers";
import { container } from "tsyringe";
import { AuthService } from "../services/auth.service";
import {
    Duplicated,
    InvalidLoginEmail,
    InvalidLoginPassword,
} from "../utils/errors.utils";
import { Response } from "express";

interface LoginInput {
    email: string;
    password: string;
}

interface RegisterInput {
    email: string;
    password: string;
}

@JsonController("/auth")
export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = container.resolve(AuthService);
    }

    @Post("/login")
    async login(@Body() input: LoginInput, @Res() response: Response) {
        try {
            const { accessToken, refreshToken } =
                await this.authService.login(input);

            response.clearCookie("refresh_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            response.cookie("refresh_token", refreshToken, {
                httpOnly: true, // Prevent JavaScript access
                secure: process.env.NODE_ENV === "production", // Send only over HTTPS
                sameSite: "strict", // Prevent CSRF
                path: "/auth/refresh-token", // Limit cookie to refresh endpoint
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return { accessToken };
        } catch (error) {
            if (
                error instanceof InvalidLoginEmail ||
                error instanceof InvalidLoginPassword
            ) {
                throw new BadRequestError("Invalid email or password");
            }

            throw new InternalServerError("Something went wrong");
        }
    }

    @Post("/refresh-token")
    async refreshToken(@CookieParam("refresh_token") refreshToken: string) {
        try {
            const accessTokenResult = await this.authService.refreshToken({
                refreshToken,
            });

            return accessTokenResult;
        } catch (error) {
            if (
                error instanceof UnauthorizedError ||
                error instanceof ForbiddenError
            ) {
                throw error;
            }

            throw new InternalServerError("Something went wrong");
        }
    }

    @Post("/register")
    @HttpCode(201)
    async register(@Body() input: RegisterInput) {
        try {
            const newUser = await this.authService.register(input);

            return newUser;
        } catch (error) {
            if (error instanceof Duplicated) {
                throw new BadRequestError("User already exists");
            }

            throw new InternalServerError("Something went wrong");
        }
    }
}
