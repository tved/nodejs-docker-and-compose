import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  FindOptionsWhere,
  In,
} from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { WishDto } from './dto/wish.dto';
import { plainToClass } from 'class-transformer';
import { WishPartialDto } from './dto/wish-partial.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number) {
    const owner = await this.usersService.findById(userId);
    const wish = await this.wishesRepository.create({
      ...createWishDto,
      owner,
    });
    await this.wishesRepository.save(wish);
    return {};
  }

  async findByUserId(userId: number): Promise<WishDto[]> {
    return this.wishesRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
  }

  async findOne(options: FindOneOptions<Wish>): Promise<WishDto> {
    const wish = await this.wishesRepository.findOne(options);
    return plainToClass(WishDto, wish, { excludeExtraneousValues: true });
  }

  async findMany(query: FindManyOptions<Wish>): Promise<WishDto[]> {
    return await this.wishesRepository.find(query);
  }

  async updateOne(
    query: FindOptionsWhere<WishDto>,
    updateWishDto: UpdateWishDto,
  ) {
    await this.wishesRepository.update(query, updateWishDto);
    return {};
  }

  async remove(query: FindOneOptions<Wish>, user: User): Promise<WishDto> {
    const wish = await this.wishesRepository.findOne(query);

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Можно удалять только свои подарки');
    }

    await this.wishesRepository.remove(wish);
    return plainToClass(WishDto, wish, { excludeExtraneousValues: true });
  }

  async copyWish(id: number, user: User) {
    const wish = await this.findOne({ where: { id } });

    const createWishDto: CreateWishDto = {
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
    };

    await this.create(createWishDto, user.id);
    wish.copied++;
    await this.wishesRepository.save(wish);
    return {};
  }

  async updateRaisedAmount(id: number, amount: number): Promise<void> {
    const wish = await this.wishesRepository.findOne({ where: { id } });

    wish.raised = Number(wish.raised) + amount;
    await this.wishesRepository.save(wish);
  }

  async findManyByIds(ids: number[]): Promise<WishPartialDto[]> {
    const wishes = await this.wishesRepository.findBy({ id: In(ids) });
    return wishes.map((wish) =>
      plainToClass(WishPartialDto, wish, { excludeExtraneousValues: true }),
    );
  }
}
