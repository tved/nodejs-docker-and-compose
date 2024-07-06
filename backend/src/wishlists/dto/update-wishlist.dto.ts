import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  itemsId?: number[];
}
