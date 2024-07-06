import { IsEmail, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(2, 30)
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @Length(2, 200)
  about?: string;

  @IsOptional()
  avatar?: string;
}
