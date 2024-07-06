import { Expose, Type } from 'class-transformer';
import { IsString, IsUrl, IsArray, IsInt, MaxLength } from 'class-validator';
import { UserPublicProfileResponseDto } from '../../users/dto/user-public.dto';
import { WishPartialDto } from '../../wishes/dto/wish-partial.dto';

export class WishlistDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @IsString()
  @MaxLength(250)
  name: string;

  @Expose()
  @IsUrl()
  image: string;

  @Expose()
  @Type(() => UserPublicProfileResponseDto)
  owner: UserPublicProfileResponseDto;

  @Expose()
  @IsArray()
  @Type(() => WishPartialDto)
  items: WishPartialDto[];
}
