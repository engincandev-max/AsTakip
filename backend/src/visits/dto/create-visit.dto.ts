import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateVisitDto {
    @IsUUID()
    @IsNotEmpty()
    customerId: string;

    @IsDateString()
    @IsNotEmpty()
    date: string; // ISO 8601 date string

    @IsString()
    @IsOptional()
    note?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;
}
