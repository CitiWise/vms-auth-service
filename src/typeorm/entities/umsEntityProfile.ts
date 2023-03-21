import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { UMSEntityIdContact } from './umsEntityIdContact';

@Entity('ums_entity_profile')
@Index(['entityId', 'profileType'], { unique: false })
export class UMSEntityProfile {
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
        length: 100,
        nullable: false,
        name: 'profile_type',
        type: 'varchar'
    })
    public profileType: string;

    @Column({
        nullable: false,
        name: 'profile_value',
        type: 'text'
    })
    public profileValue: string;

    @OneToMany(() => UMSEntityIdContact, (data) => data.profile, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'entityId', referencedColumnName: 'entity_id' })
    idContact?: UMSEntityIdContact[];
}
