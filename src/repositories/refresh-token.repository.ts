import { DataSource } from "typeorm";
import { injectable } from "tsyringe";

import { BaseRepository } from "./base.repository";
import { RefreshToken } from "../entities/refresh-token.entity";

@injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
    constructor(dataSource: DataSource) {
        super(RefreshToken, dataSource);
    }
}
