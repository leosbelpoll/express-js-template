import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { AppDataSource } from "./typeorm.config";
import { AuthService } from "./services/auth.service";

container.register<UserRepository>(UserRepository, {
    useFactory: () => new UserRepository(AppDataSource),
});

container.register<AuthService>(AuthService, { useClass: AuthService });
container.register<UserService>(UserService, { useClass: UserService });
