import {
    Controller,
    Post,
    Get,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Res,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { existsSync } from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('upload/:customerId')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    uploadFile(@Param('customerId') customerId: string, @UploadedFile() file: Express.Multer.File) {
        return this.attachmentsService.create(customerId, file);
    }

    @Get('customer/:customerId')
    findAll(@Param('customerId') customerId: string) {
        return this.attachmentsService.findAllByCustomer(customerId);
    }

    @Get(':id')
    async getFile(@Param('id') id: string, @Res() res: Response) {
        const attachment = await this.attachmentsService.findOne(+id);
        const filePath = join(process.cwd(), attachment.path);

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found on disk');
        }

        res.sendFile(filePath);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.attachmentsService.remove(+id);
    }
}
