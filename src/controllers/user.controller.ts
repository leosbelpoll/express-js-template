import { JsonController, Get, UseBefore, Req } from "routing-controllers";
import { Request } from "express";
import { container } from "tsyringe";
import { UserService } from "../services/user.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { getUserFromRequest } from "../utils/express.util";

@JsonController("/users")
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = container.resolve(UserService);
    }

    @Get("/")
    getUsers() {
        return this.userService.getAllUsers();
    }

    @Get("/me")
    @UseBefore(AuthMiddleware)
    async getMe(@Req() request: Request) {
        const { userId } = getUserFromRequest(request);

        const user = await this.userService.getUserById(userId);

        return user;
    }
}
