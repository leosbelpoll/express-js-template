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
import { RoleService } from "../services/role.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

interface CreateRoleInput {
    name: string;
    permissionIds: string[];
}

@injectable()
@JsonController("/roles")
@UseBefore(AuthMiddleware)
export class RoleController {
    private roleService: RoleService;

    constructor() {
        this.roleService = container.resolve(RoleService);
    }

    @Get("/")
    getRoles() {
        return this.roleService.getAllRoles();
    }

    @Get("/:id")
    getRole(@Param("id") id: string) {
        return this.roleService.getRoleById(id);
    }

    @Post("/")
    @HttpCode(201)
    async createRole(@Body() input: CreateRoleInput) {
        const { name, permissionIds = [] } = input;
        const role = await this.roleService.createRole({
            name,
            permissionIds,
        });

        return role;
    }
}
