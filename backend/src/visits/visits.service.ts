import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Visit } from './entities/visit.entity';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepository: Repository<Visit>,
  ) { }

  create(createVisitDto: CreateVisitDto) {
    const visit = this.visitsRepository.create(createVisitDto);
    return this.visitsRepository.save(visit);
  }

  findAll() {
    return this.visitsRepository.find({ relations: ['customer'], order: { date: 'DESC' } });
  }

  findOne(id: string) {
    return this.visitsRepository.findOne({ where: { id }, relations: ['customer'] });
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    const visit = await this.findOne(id);
    if (!visit) {
      throw new NotFoundException(`Visit #${id} not found`);
    }
    Object.assign(visit, updateVisitDto);
    return this.visitsRepository.save(visit);
  }

  async remove(id: string) {
    const visit = await this.findOne(id);
    if (!visit) {
      throw new NotFoundException(`Visit #${id} not found`);
    }
    return this.visitsRepository.remove(visit);
  }
}
