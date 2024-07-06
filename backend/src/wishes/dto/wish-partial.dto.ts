import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class WishPartialDto {
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
  link: string;

  @Expose()
  image: string;

  @Expose()
  @IsInt()
  @Min(1)
  price: number;

  @Expose()
  @IsInt()
  @Min(1)
  raised: number;

  @Expose()
  @IsInt()
  copied: number;

  @Expose()
  @IsString()
  @MaxLength(1024)
  description: string;
}
