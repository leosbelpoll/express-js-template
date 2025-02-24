import "reflect-metadata";
import { container, InjectionToken } from "tsyringe";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { AppDataSource } from "./typeorm.config";
import { AuthService } from "./services/auth.service";
import { EnvService } from "./services/env.service";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";
import { RoleService } from "./services/role.service";
import { PermissionRepository } from "./repositories/permission.repository";
import { RoleRepository } from "./repositories/role.repository";
import { PermissionService } from "./services/permission.service";

function registerRepository<T>(
    token: InjectionToken<T>,
    repositoryClass: new (dataSource: any) => T
) {
    container.register<T>(token, {
        useFactory: () => new repositoryClass(AppDataSource),
    });
}

function registerService<T>(
    token: InjectionToken<T>,
    serviceClass: new () => T
) {
    container.register<T>(token, { useClass: serviceClass });
}

// Repositories
registerRepository(RefreshTokenRepository, RefreshTokenRepository);
registerRepository(RoleRepository, RoleRepository);
registerRepository(PermissionRepository, PermissionRepository);
registerRepository(UserRepository, UserRepository);

// Services
registerService(AuthService, AuthService);
registerService(RoleService, RoleService);
registerService(PermissionService, PermissionService);
registerService(UserService, UserService);
registerService(EnvService, EnvService);
