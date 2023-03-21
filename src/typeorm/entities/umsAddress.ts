import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('ums_address')
export class UMSAddress {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    public deletedAt?: Date;

    @Column({
        length: 50,
        nullable: true,
        name: 'type',
        type: 'varchar'
    })
    public type: string;

    @Column({
        nullable: false,
        name: 'line1',
        type: 'text'
    })
    public line1: string;

    @Column({
        nullable: true,
        name: 'line2',
        type: 'text'
    })
    public line2: string;

    @Column({
        length: 1000,
        nullable: true,
        name: 'landmark',
        type: 'varchar'
    })
    public landmark: string;

    @Column({
        length: 100,
        nullable: false,
        name: 'city',
        type: 'varchar'
    })
    public city: string;

    @Column({
        length: 100,
        nullable: false,
        name: 'state',
        type: 'varchar'
    })
    public state: string;

    @Column({
        length: 100,
        nullable: true,
        name: 'country',
        type: 'varchar'
    })
    public country: string;

    @Column({
        length: 10,
        nullable: false,
        name: 'pincode',
        type: 'varchar'
    })
    public pincode: string;
}
