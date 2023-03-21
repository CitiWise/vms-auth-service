import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('ums_oauth_code')
@Index(['code', 'stale'], { unique: true })
export class UMSOauthCode {
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
        name: 'entity_id',
        type: 'varchar'
    })
    public entityId: string;

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
        name: 'code',
        type: 'varchar'
    })
    public code: string;

    @Column({
        type: 'bigint',
        nullable: false,
        name: 'expiry'
    })
    public expiry: number;

    @Column({
        nullable: false,
        name: 'stale',
        type: 'boolean'
    })
    public stale: boolean;

    @Column({
        nullable: true,
        name: 'metadata',
        type: 'text'
    })
    public metadata: string;
}
