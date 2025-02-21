import {
    JsonController,
    Post,
    Body,
    BadRequestError,
    InternalServerError,
    HttpCode,
} from "routing-controllers";
import { container } from "tsyringe";
import { AuthService } from "../services/auth.service";
import {
    Duplicated,
    InvalidLoginEmail,
    InvalidLoginPassword,
} from "../utils/errors.utils";

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
    async login(@Body() input: LoginInput) {
        try {
            const token = await this.authService.login(input);

            return token;
        } catch (error) {
            if (
                error instanceof InvalidLoginEmail ||
                error instanceof InvalidLoginPassword
            ) {
                throw new BadRequestError("Invalid email or password");
            }

            console.log(error);

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
