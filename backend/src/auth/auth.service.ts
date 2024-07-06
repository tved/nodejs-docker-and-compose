import { Injectable, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyHash } from 'src/common/decorators/helpers/hash';
import { ErrorCode } from 'src/exceptions/error-codes';
import { ServerException } from 'src/exceptions/server.exception';
import { ServerExceptionFilter } from 'src/filter/server-exception.filter';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@UseFilters(ServerExceptionFilter)
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    try {
      const user = await this.usersService.findOne({
        select: { username: true, password: true, id: true },
        where: { username },
      });

      if (user && (await verifyHash(password, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
    } catch {
      throw new ServerException(ErrorCode.LoginOrPasswordIncorrect);
    }
  }

  async login(user: User) {
    const { username, id: userId } = user;

    return {
      access_token: await this.jwtService.signAsync({ username, userId }),
    };
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;

    const userExists = await this.usersService.findOne({
      where: [{ username }, { email }],
    });

    if (userExists) {
      throw new ServerException(ErrorCode.UserAlreadyExists);
    }

    return this.usersService.create(createUserDto);
  }
}
