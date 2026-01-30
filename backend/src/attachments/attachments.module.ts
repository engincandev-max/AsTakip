import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Attachment, Customer])],
    providers: [AttachmentsService],
    controllers: [AttachmentsController],
    exports: [AttachmentsService],
})
export class AttachmentsModule { }
