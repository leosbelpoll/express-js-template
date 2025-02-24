import { container, injectable } from "tsyringe";
import { RoleRepository } from "../repositories/role.repository";
import { Role } from "../entities/role.entity";
import { Duplicated, NotFound } from "../utils/errors.utils";
import { PermissionService } from "./permission.service";
import { PermissionRepository } from "../repositories/permission.repository";
import { In } from "typeorm";

interface CreateRoleInput {
    name: string;
    permissionIds: string[];
}

@injectable()
export class RoleService {
    private roleRepository: RoleRepository;
    private permissionRepository: PermissionRepository;

    constructor() {
        this.roleRepository = container.resolve(RoleRepository);
        this.permissionRepository = container.resolve(PermissionRepository);
    }

    async getAllRoles(): Promise<Role[]> {
        return this.roleRepository.find();
    }

    async getRoleById(roleId: string): Promise<Role> {
        const role = await this.roleRepository.findOneBy({
            id: roleId,
        });

        if (!role) {
            throw new NotFound("Role not found", {
                resource: "Role",
                identifierAttribute: "id",
                identifierValue: roleId,
            });
        }

        return role;
    }

    async createRole(input: CreateRoleInput): Promise<Role> {
        const { name, permissionIds } = input;

        const existingRole = await this.roleRepository.findOneBy({
            name,
        });

        if (existingRole) {
            throw new Duplicated("Role already exists", {
                resource: "Role",
                id: existingRole.id,
            });
        }

        const permissions = await this.permissionRepository.findBy({
            id: In(permissionIds),
        });

        if (permissions.length !== permissionIds.length) {
            throw new Error("Some permissions were not found");
        }

        const roleCreation = this.roleRepository.create({
            name,
            permissions,
        });

        const role = await this.roleRepository.save(roleCreation);

        return role;
    }

    async deleteRole(roleId: string): Promise<void> {
        const existingRole = await this.roleRepository.findOneBy({
            id: roleId,
        });

        if (!existingRole) {
            throw new NotFound("Role not found", {
                resource: "Role",
                identifierAttribute: "id",
                identifierValue: roleId,
            });
        }

        this.roleRepository.softDelete(roleId);
    }
}
