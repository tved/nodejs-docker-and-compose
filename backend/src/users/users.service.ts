import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  FindOptionsWhere,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashValue } from 'src/common/decorators/helpers/hash';
import { Wish } from 'src/wishes/entities/wish.entity';
import { WishDto } from 'src/wishes/dto/wish.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: await hashValue(password),
    });

    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  async findOne(query: FindOneOptions<User>) {
    return this.usersRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<User>) {
    return this.usersRepository.find(query);
  }

  async updateOne(query: FindOptionsWhere<User>, updateUserDto: UpdateUserDto) {
    const { password, email, username } = updateUserDto;
    const { id } = query;
    const user = await this.findById(id as number);
    if (email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }

    if (username) {
      const existingUserByUsername = await this.usersRepository.findOne({
        where: { username },
      });

      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw new ConflictException(
          'Пользователь с таким именем уже существует',
        );
      }
    }
    if (password) {
      updateUserDto.password = await hashValue(password);
    }
    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
    return updatedUser;
  }

  async removeOne(query: FindOptionsWhere<User>) {
    const user = await this.usersRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.usersRepository.delete(query);
  }

  async getUserWishes(query: FindManyOptions<WishDto>): Promise<WishDto[]> {
    const wishes = await this.wishesRepository.find(query);
    return wishes;
  }
}
