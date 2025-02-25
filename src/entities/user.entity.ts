import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { RefreshToken } from "./refresh-token.entity";
import { Role } from "./role.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    @Exclude()
    password: string;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
        cascade: true,
    })
    refreshTokens: RefreshToken[];

    @ManyToMany(() => Role, (role) => role.users)
    roles: Role[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt?: Date;
}
