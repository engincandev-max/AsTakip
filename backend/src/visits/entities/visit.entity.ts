import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

@Entity()
export class Visit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customerId: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'float', nullable: true })
    latitude: number;

    @Column({ type: 'float', nullable: true })
    longitude: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Customer, (customer) => customer.visits, { onDelete: 'CASCADE' })
    customer: Customer;
}
