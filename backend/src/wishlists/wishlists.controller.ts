import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@UseGuards(JwtAuthGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @AuthUser() user: User,
  ) {
    return this.wishlistsService.create(createWishlistDto, user);
  }

  @Get()
  async findAll() {
    return this.wishlistsService.findAll({ relations: ['owner', 'items'] });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.wishlistsService.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @AuthUser() user: User,
  ) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Можно редактировать только свои вишлисты');
    }

    return this.wishlistsService.updateOne({ id }, updateWishlistDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @AuthUser() user: User,
  ): Promise<Wishlist> {
    return this.wishlistsService.remove(
      { where: { id }, relations: ['owner'] },
      user,
    );
  }
}
