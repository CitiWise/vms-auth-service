import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('ums_client_info')
@Index(['clientId', 'clientSecret'], { unique: true })
export class UMSClientInfo {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    public deletedAt?: Date;

    @Column({
        length: 36,
        nullable: false,
        name: 'client_id',
        type: 'varchar'
    })
    public clientId: string;

    @Column({
        length: 100,
        nullable: false,
        name: 'client_secret',
        type: 'varchar'
    })
    public clientSecret: string;

    @Column({
        nullable: false,
        name: 'client_attributes',
        type: 'json'
    })
    public clientAttributes: object;

    @Column({
        nullable: false,
        name: 'token_expiry_millis',
        type: 'bigint'
    })
    public tokenExpiryMillis: number;
}
