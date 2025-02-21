import { container, injectable } from "tsyringe";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import { Duplicated, UserNotFound } from "../utils/errors.utils";

@injectable()
export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = container.resolve(UserRepository);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async getUserById(userId: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new UserNotFound("User not found", {
                identifierAttribute: "id",
                identifierValue: userId,
            });
        }

        return user;
    }

    async getUserForLogin(email: string): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        if (!user) {
            throw new UserNotFound("User not found", {
                identifierAttribute: "email",
                identifierValue: email,
            });
        }

        return user;
    }

    async createUser(input: Omit<User, "id">): Promise<Omit<User, "password">> {
        const { email } = input;

        const existingUser = await this.userRepository.findOneBy({ email });

        if (existingUser) {
            throw new Duplicated("User already exists", {
                resource: "User",
                id: existingUser.id,
            });
        }

        const userQuery = this.userRepository.create(input);

        const user = await this.userRepository.save(userQuery);

        return user;
    }
}
