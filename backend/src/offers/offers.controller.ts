import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { WishesService } from 'src/wishes/wishes.service';
import { Offer } from './entities/offer.entity';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  async create(@Body() createOfferDto: CreateOfferDto, @AuthUser() user: User) {
    const { amount } = createOfferDto;
    const wish = await this.wishesService.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (user.id === wish.owner.id) {
      throw new BadRequestException('Нельзя скинуться на собственные подарки');
    }

    const raisedSum = Number(wish.raised) + Number(amount);
    if (raisedSum > Number(wish.price)) {
      throw new BadRequestException('На этот подарок уже собраны деньги');
    }

    const offer = await this.offersService.create(createOfferDto, user.id);
    await this.wishesService.updateRaisedAmount(
      createOfferDto.itemId,
      +createOfferDto.amount,
    );
    return offer;
  }

  @Get()
  async findAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Offer> {
    return this.offersService.findOne({ where: { id: +id } });
  }
}
