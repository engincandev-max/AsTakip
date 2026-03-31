import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService implements OnModuleInit {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) { }

  async onModuleInit() {
    // Eski müşteri kayıtlarında (null olanlarda) oluşturan kişiyi varsayılan 'admin' olarak ata
    await this.customersRepository.update(
      { createdByUsername: IsNull() },
      { createdByUsername: 'admin' }
    );
  }

  create(createCustomerDto: CreateCustomerDto, createdByUsername: string) {
    const customer = this.customersRepository.create({ ...createCustomerDto, createdByUsername });
    return this.customersRepository.save(customer);
  }

  findAll() {
    return this.customersRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.customersRepository.findOne({
      where: { id },
      relations: ['visits', 'attachments'],
      order: {
        visits: { date: 'DESC' },
        attachments: { createdAt: 'DESC' }
      }
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    Object.assign(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }
    return this.customersRepository.remove(customer);
  }
}
