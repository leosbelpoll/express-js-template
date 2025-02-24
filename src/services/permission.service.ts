import { container, injectable } from "tsyringe";
import { PermissionRepository } from "../repositories/permission.repository";
import { Permission } from "../entities/permission.entity";
import { Duplicated, NotFound } from "../utils/errors.utils";
import { RoleRepository } from "../repositories/role.repository";
import { In } from "typeorm";

interface CreatePermissionInput {
    name: string;
    roleIds: string[];
}

@injectable()
export class PermissionService {
    private permissionRepository: PermissionRepository;
    private roleRepository: RoleRepository;

    constructor() {
        this.permissionRepository = container.resolve(PermissionRepository);
        this.roleRepository = container.resolve(RoleRepository);
    }

    async getAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async getPermissionById(permissionId: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOneBy({
            id: permissionId,
        });

        if (!permission) {
            throw new NotFound("Permission not found", {
                resource: "Permission",
                identifierAttribute: "id",
                identifierValue: permissionId,
            });
        }

        return permission;
    }

    async createPermission(input: CreatePermissionInput): Promise<Permission> {
        const { name, roleIds } = input;

        const existingPermission = await this.permissionRepository.findOneBy({
            name,
        });

        if (existingPermission) {
            throw new Duplicated("Permission already exists", {
                resource: "Permission",
                id: existingPermission.id,
            });
        }

        const roles = await this.roleRepository.findBy({
            id: In(roleIds),
        });

        if (roles.length !== roleIds.length) {
            throw new Error("Some roles do not exist");
        }

        const permissionCreation = this.permissionRepository.create({
            name,
            roles,
        });

        const permission =
            await this.permissionRepository.save(permissionCreation);

        return permission;
    }

    async deletePermission(permissionId: string): Promise<void> {
        const existingPermission = await this.permissionRepository.findOneBy({
            id: permissionId,
        });

        if (!existingPermission) {
            throw new NotFound("Permission not found", {
                resource: "Permission",
                identifierAttribute: "id",
                identifierValue: permissionId,
            });
        }

        this.permissionRepository.softDelete(permissionId);
    }
}
