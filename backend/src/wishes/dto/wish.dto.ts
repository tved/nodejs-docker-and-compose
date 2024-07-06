import { Expose, Type } from 'class-transformer';
import { UserPublicProfileResponseDto } from '../../users/dto/user-public.dto';
import { OfferDto } from 'src/offers/dto/offer.dto';
import { WishPartialDto } from './wish-partial.dto';

export class WishDto extends WishPartialDto {
  @Expose()
  @Type(() => UserPublicProfileResponseDto)
  owner: UserPublicProfileResponseDto;

  @Expose()
  @Type(() => OfferDto)
  offers: OfferDto[];
}
