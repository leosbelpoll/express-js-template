import jwt from "jsonwebtoken";
import { container, injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { hash, verifyHash } from "../utils/crypto.util";
import {
    InvalidLoginEmail,
    InvalidLoginPassword,
    UserNotFound,
} from "../utils/errors.utils";
import { UserService } from "./user.service";
import { JwtUser } from "../dtos/jwt-user.dto";

interface LoginInput {
    email: string;
    password: string;
}

interface LoginOutput {
    token: string;
}

interface RegisterInput {
    email: string;
    password: string;
}

@injectable()
export class AuthService {
    private userService: UserService;

    constructor() {
        this.userService = container.resolve(UserService);
    }

    async login(input: LoginInput): Promise<LoginOutput> {
        const secretKey = process.env.SECRET_KEY || "secret";

        const { email, password } = input;

        try {
            const user = await this.userService.getUserForLogin(email);

            const isSamePassword = await verifyHash(password, user.password);

            if (!isSamePassword) {
                throw new InvalidLoginPassword("Invalid password", { email });
            }

            const payload: JwtUser = {
                userId: user.id,
                email: user.email,
                permissions: [],
            };

            const options: jwt.SignOptions = {
                expiresIn: "15m",
            };

            const token = jwt.sign(payload, secretKey, options);

            return { token };
        } catch (error) {
            if (error instanceof UserNotFound) {
                throw new InvalidLoginEmail("User not found", { email });
            }

            throw error;
        }
    }

    async register(input: RegisterInput): Promise<Omit<User, "password">> {
        const { password } = input;

        const hashedPassword = await hash(password);

        const user = this.userService.createUser({
            ...input,
            password: hashedPassword,
        });

        return user;
    }
}
