import { CreateWishDto } from './create-wish.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateWishDto extends PartialType(CreateWishDto) {}
