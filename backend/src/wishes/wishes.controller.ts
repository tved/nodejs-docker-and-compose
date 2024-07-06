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
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Wish } from './entities/wish.entity';
import { FindOneOptions } from 'typeorm';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';
import { WishDto } from './dto/wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  async findRecent(): Promise<WishDto[]> {
    return this.wishesService.findMany({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  @Get('top')
  async findPopular(): Promise<WishDto[]> {
    return this.wishesService.findMany({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user) {
    return this.wishesService.create(createWishDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WishDto> {
    return this.wishesService.findOne({
      where: { id: +id },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    const parsedId = parseInt(id, 10);

    const wish = await this.wishesService.findOne({
      where: { id: +id },
      relations: ['owner'],
    });

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException(
        'Нельзя редактировать подарки других пользователей',
      );
    }

    if (wish.raised > 0 && 'price' in updateWishDto) {
      throw new ForbiddenException('Нельзя изменять стоимость подарка');
    }

    return this.wishesService.updateOne({ id: parsedId }, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthUser() user: User,
  ): Promise<WishDto> {
    const options: FindOneOptions<Wish> = {
      where: { id: +id },
      relations: ['owner', 'offers', 'offers.user'],
    };

    return this.wishesService.remove(options, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Param('id') id: string, @AuthUser() user: User) {
    return this.wishesService.copyWish(+id, user);
  }
}
