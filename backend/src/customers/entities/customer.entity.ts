import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Visit } from '../../visits/entities/visit.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column('simple-array', { nullable: true })
  additionalPhones: string[];

  @Column('jsonb', { nullable: true, default: '[]' })
  locations: { name: string; lat: number; lng: number }[];

  @Column({ nullable: true })
  createdByUsername: string;

  @Column({ nullable: true })
  constructionType: string;

  @Column({ nullable: true })
  stage: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Visit, (visit) => visit.customer)
  visits: Visit[];

  @OneToMany(() => Attachment, (attachment) => attachment.customer)
  attachments: Attachment[];
}
