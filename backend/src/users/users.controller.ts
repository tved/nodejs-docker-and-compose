import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Like } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { UserPublicProfileResponseDto } from './dto/user-public.dto';
import { WishDto } from 'src/wishes/dto/wish.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private wishesService: WishesService,
  ) {}

  @Get('me')
  async findOwn(@AuthUser() user: User): Promise<User> {
    return this.usersService.findOne({
      where: { id: user.id },
      select: {
        email: true,
        username: true,
        id: true,
        avatar: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Get('me/wishes')
  async findOwnWishes(@AuthUser() user: User): Promise<WishDto[]> {
    return this.wishesService.findByUserId(user.id);
  }

  @Patch('me')
  async updateOne(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateOne({ id: user.id }, updateUserDto);
  }

  @Post('find')
  async search(@Body('query') query: string): Promise<User[]> {
    return this.usersService.findMany({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
      select: ['id', 'username', 'about', 'avatar', 'createdAt', 'updatedAt'],
    });
  }

  @Get(':username')
  async findOne(
    @Param('username') username: string,
  ): Promise<UserPublicProfileResponseDto> {
    const user = this.usersService.findOne({ where: { username } });
    return plainToClass(UserPublicProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':username/wishes')
  async getWishes(@Param('username') username: string): Promise<WishDto[]> {
    const user = await this.usersService.findOne({ where: { username } });

    return this.usersService.getUserWishes({
      where: { owner: { id: user.id } },
    });
  }
}
