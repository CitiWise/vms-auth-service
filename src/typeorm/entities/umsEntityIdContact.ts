import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne
} from 'typeorm';
import { UMSEntityProfile } from './umsEntityProfile';

@Entity('ums_entity_id_contact')
@Index(['contactType', 'contactValue'], { unique: false })
export class UMSEntityIdContact {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    public deletedAt?: Date;

    @Index({ unique: false })
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
        name: 'contact_type',
        type: 'varchar'
    })
    public contactType: string;

    @Column({
        length: 100,
        nullable: false,
        name: 'contact_value',
        type: 'varchar'
    })
    public contactValue: string;

    @Column({
        length: 50,
        nullable: true,
        name: 'status',
        type: 'varchar'
    })
    public status: string;

    @ManyToOne(() => UMSEntityProfile, (trail) => trail.idContact)
    @JoinColumn({ name: 'entity_id', referencedColumnName: 'entityId' })
    profile: UMSEntityProfile[];
}
