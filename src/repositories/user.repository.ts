import { DataSource } from "typeorm";
import { injectable } from "tsyringe";

import { BaseRepository } from "./base.repository";
import { User } from "../entities/user.entity";

@injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(dataSource: DataSource) {
        super(User, dataSource);
    }
}
