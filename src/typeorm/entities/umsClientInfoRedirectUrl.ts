import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('ums_client_info_redirect_urls')
@Index(['clientId'], { unique: false })
export class UMSClientInfoRedirectUrls {
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
        nullable: false,
        name: 'redirect_url',
        type: 'text'
    })
    public redirectUrl: string;
}
