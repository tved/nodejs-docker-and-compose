import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { PickType } from '@nestjs/swagger';

export class SigninUserDto extends PickType(CreateUserDto, [
  'username',
  'password',
] as const) {}
