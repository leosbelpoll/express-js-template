import { DataSource } from "typeorm";
import { injectable } from "tsyringe";

import { BaseRepository } from "./base.repository";
import { Permission } from "../entities/permission.entity";

@injectable()
export class PermissionRepository extends BaseRepository<Permission> {
    constructor(dataSource: DataSource) {
        super(Permission, dataSource);
    }
}
