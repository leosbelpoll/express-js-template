import { DataSource } from "typeorm";
import { injectable } from "tsyringe";

import { BaseRepository } from "./base.repository";
import { Role } from "../entities/role.entity";

@injectable()
export class RoleRepository extends BaseRepository<Role> {
    constructor(dataSource: DataSource) {
        super(Role, dataSource);
    }
}
