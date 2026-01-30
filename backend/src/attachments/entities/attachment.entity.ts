import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('attachments')
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column()
    originalName: string;

    @Column()
    mimetype: string;

    @Column()
    path: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Customer, (customer) => customer.attachments, { onDelete: 'CASCADE' })
    customer: Customer;
}
