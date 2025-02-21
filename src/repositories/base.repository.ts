import { injectable } from "tsyringe";
import { Repository, EntityTarget, DataSource, ObjectLiteral } from "typeorm";

@injectable()
export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
    constructor(entity: EntityTarget<T>, dataSource: DataSource) {
        super(entity, dataSource.createEntityManager());
    }
}
