import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const { itemsId, ...wishlistData } = createWishlistDto;
    const items = await this.wishesService.findManyByIds(itemsId);

    const wishlist = this.wishlistsRepository.create({
      ...wishlistData,
      owner: user,
      items,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  async findAll(query: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    return await this.wishlistsRepository.findOne(query);
  }

  async updateOne(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    await this.wishlistsRepository.update(query, updateWishlistDto);

    const updatedWishlist = await this.wishlistsRepository.findOne({
      where: query,
      relations: ['owner', 'items'],
    });

    return updatedWishlist;
  }

  async remove(query: FindOneOptions<Wishlist>, user: User): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne(query);

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Можно удалять только свои вишлисты');
    }

    await this.wishlistsRepository.remove(wishlist);
    return wishlist;
  }
}
