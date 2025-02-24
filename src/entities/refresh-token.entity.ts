import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    token: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: "CASCADE",
    })
    user: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt?: Date;
}
