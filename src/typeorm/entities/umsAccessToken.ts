import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("ums_access_token")
@Index(["clientId", "entityId"], { unique: true })
export class UMSAccessToken {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  public deletedAt?: Date;

  @Column({
    length: 36,
    nullable: false,
    name: "entity_id",
    type: "varchar",
  })
  public entityId: string;

  @Column({
    length: 36,
    nullable: false,
    name: "client_id",
    type: "varchar",
  })
  public clientId: string;

  @Index({ unique: true })
  @Column({
    length: 36,
    nullable: false,
    name: "token",
    type: "varchar",
  })
  public token: string;

  @Column({
    type: "bigint",
    nullable: false,
    name: "expiry",
  })
  public expiry: number;

  @Column({
    nullable: true,
    name: "metadata",
    type: "text",
  })
  public metadata: string;
}
