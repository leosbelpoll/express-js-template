import jwt from "jsonwebtoken";
import { container, injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { hash, verifyHash } from "../utils/crypto.util";
import {
    InvalidLoginEmail,
    InvalidLoginPassword,
    NotFound,
    UserNotFound,
} from "../utils/errors.utils";
import { UserService } from "./user.service";
import { JwtUser } from "../dtos/jwt-user.dto";
import { EnvService } from "./env.service";
import { UnauthorizedError } from "routing-controllers";
import { RefreshTokenService } from "./refresh-token.service";
import { RefreshToken } from "../entities/refresh-token.entity";

interface LoginInput {
    email: string;
    password: string;
}

interface RefreshTokenInput {
    refreshToken: string;
}

interface LoginOutput {
    accessToken: string;
    refreshToken: string;
}

interface RefreshTokenOutput {
    accessToken: string;
}

interface RegisterInput {
    email: string;
    password: string;
}

@injectable()
export class AuthService {
    private userService: UserService;
    private refreshTokenService: RefreshTokenService;
    private envService: EnvService;

    constructor() {
        this.userService = container.resolve(UserService);
        this.refreshTokenService = container.resolve(RefreshTokenService);
        this.envService = container.resolve(EnvService);
    }

    async login(input: LoginInput): Promise<LoginOutput> {
        const { email, password } = input;

        try {
            const user = await this.userService.getUserForLogin(email);

            const isSamePassword = await verifyHash(password, user.password);

            if (!isSamePassword) {
                throw new InvalidLoginPassword("Invalid password", { email });
            }

            const payload: JwtUser = {
                userId: user.id,
            };

            const accessTokenDuration = this.envService.getEnv(
                "ACCESS_TOKEN_DURATION"
            );

            const accessTokenOptions: jwt.SignOptions = {
                expiresIn: accessTokenDuration as any,
            };

            const refreshTokenDuration = this.envService.getEnv(
                "REFRESH_TOKEN_DURATION"
            );

            const refreshTokenOptions: jwt.SignOptions = {
                expiresIn: refreshTokenDuration as any,
            };

            const accessTokenSecret = this.envService.getEnv(
                "ACCESS_TOKEN_SECRET"
            );

            const refreshTokenSecret = this.envService.getEnv(
                "REFRESH_TOKEN_SECRET"
            );

            const accessToken = jwt.sign(
                payload,
                accessTokenSecret,
                accessTokenOptions
            );

            const refreshToken = jwt.sign(
                payload,
                refreshTokenSecret,
                refreshTokenOptions
            );

            const removeOtherRefreshTokensAfterLogin =
                this.envService.getEnv<boolean>(
                    "REMOVE_OTHER_REFRESH_TOKENS_AFTER_LOGIN"
                );

            if (removeOtherRefreshTokensAfterLogin) {
                await this.refreshTokenService.removeUserRefreshTokens(user.id);
            }

            const newRefreshToken =
                await this.refreshTokenService.createRefreshToken({
                    token: refreshToken,
                    user,
                });

            return { accessToken, refreshToken: newRefreshToken.token };
        } catch (error) {
            if (error instanceof UserNotFound) {
                throw new InvalidLoginEmail("User not found", { email });
            }

            throw error;
        }
    }

    async refreshToken(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
        const { refreshToken } = input;

        let dbRefreshToken: RefreshToken;

        try {
            dbRefreshToken =
                await this.refreshTokenService.getRefreshTokenByToken(
                    refreshToken
                );
        } catch (error) {
            if (error instanceof NotFound) {
                throw new UnauthorizedError("Invalid token");
            }

            throw error;
        }

        const refreshTokenSecret = this.envService.getEnv(
            "REFRESH_TOKEN_SECRET"
        );

        let accessToken: string = "";

        jwt.verify(refreshToken, refreshTokenSecret, (error, payload: any) => {
            if (error) {
                throw new UnauthorizedError("Invalid token");
            }

            const accessTokenSecret = this.envService.getEnv(
                "ACCESS_TOKEN_SECRET"
            );

            const accessTokenPayload: JwtUser = {
                userId: payload.userId,
            };

            const accessTokenDuration = this.envService.getEnv(
                "ACCESS_TOKEN_DURATION"
            );

            const accessTokenOptions: jwt.SignOptions = {
                expiresIn: accessTokenDuration as any,
            };

            accessToken = jwt.sign(
                accessTokenPayload,
                accessTokenSecret,
                accessTokenOptions
            );
        });

        return { accessToken };
    }

    async register(input: RegisterInput): Promise<Omit<User, "password">> {
        const { password } = input;

        const hashedPassword = await hash(password);

        const user = this.userService.createUser({
            ...input,
            password: hashedPassword,
            refreshTokens: [],
            roles: [],
        });

        return user;
    }
}
