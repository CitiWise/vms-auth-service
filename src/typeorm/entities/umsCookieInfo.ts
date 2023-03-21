import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('ums_cookie_info')
@Index(['clientId', 'value'], { unique: true })
@Index(['clientId', 'entityId'], { unique: false })
export class UMSCookieInfo {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    public deletedAt?: Date;

    @Column({
        length: 100,
        nullable: false,
        name: 'name',
        type: 'varchar'
    })
    public name: string;

    @Index({ unique: true })
    @Column({
        length: 100,
        nullable: false,
        name: 'value',
        type: 'varchar'
    })
    public value: string;

    @Column({
        length: 36,
        nullable: false,
        name: 'entity_id',
        type: 'varchar'
    })
    public entityId: string;

    @Column({
        type: 'bigint',
        nullable: false,
        name: 'expiry'
    })
    public expiry: number;

    @Column({
        length: 36,
        nullable: false,
        name: 'client_id',
        type: 'varchar'
    })
    public clientId: string;
}
