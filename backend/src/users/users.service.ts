import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        // Create admin user if it doesn't exist
        const adminExists = await this.usersRepository.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            const admin = this.usersRepository.create({
                username: 'admin',
                passwordHash,
            });
            await this.usersRepository.save(admin);
            console.log('Admin user created: admin / admin123');
        }
    }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }
}
