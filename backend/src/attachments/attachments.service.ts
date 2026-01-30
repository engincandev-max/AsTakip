import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class AttachmentsService {
    constructor(
        @InjectRepository(Attachment)
        private attachmentsRepository: Repository<Attachment>,
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    async create(customerId: string, file: Express.Multer.File) {
        const customer = await this.customersRepository.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const attachment = this.attachmentsRepository.create({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            path: file.path,
            customer,
        });

        return this.attachmentsRepository.save(attachment);
    }

    async findAllByCustomer(customerId: string) {
        return this.attachmentsRepository.find({
            where: { customer: { id: customerId } },
            order: { createdAt: 'DESC' },
        });
    }

    async remove(id: number) {
        const attachment = await this.attachmentsRepository.findOne({ where: { id } });
        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        try {
            await unlink(attachment.path);
        } catch (err) {
            console.error('Error deleting file:', err);
        }

        return this.attachmentsRepository.remove(attachment);
    }

    async findOne(id: number) {
        const attachment = await this.attachmentsRepository.findOne({ where: { id } });
        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }
        return attachment;
    }
}
