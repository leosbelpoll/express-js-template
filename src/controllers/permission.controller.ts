import {
    JsonController,
    Get,
    UseBefore,
    Param,
    HttpCode,
    Post,
    Body,
} from "routing-controllers";
import { container, injectable } from "tsyringe";
import { PermissionService } from "../services/permission.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

interface CreatePermissionInput {
    name: string;
    roleIds: string[];
}

@injectable()
@JsonController("/permissions")
@UseBefore(AuthMiddleware)
export class PermissionController {
    private permissionService: PermissionService;

    constructor() {
        this.permissionService = container.resolve(PermissionService);
    }

    @Get("/")
    getPermissions() {
        return this.permissionService.getAllPermissions();
    }

    @Get("/:id")
    getPermission(@Param("id") id: string) {
        return this.permissionService.getPermissionById(id);
    }

    @Post("/")
    @HttpCode(201)
    async createPermission(@Body() input: CreatePermissionInput) {
        const { name, roleIds = [] } = input;
        const permission = await this.permissionService.createPermission({
            name,
            roleIds,
        });

        return permission;
    }
}
