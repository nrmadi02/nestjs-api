import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  paginate,
  paginateOutput,
  PaginateOutput,
} from 'src/common/utils/pagination.util';
import { User } from '@prisma/client';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
  ) {}

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto);

    return 'This action adds a new user';
  }

  async findAll(query: UserQueryDto): Promise<PaginateOutput<User>> {
    this.logger.info('Get all users');
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        ...paginate({
          page: query.page,
          size: query.size,
        }),
      }),
      this.prisma.user.count(),
    ]);

    return paginateOutput<User>(users, total, {
      page: query.page,
      size: query.size,
    });
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException([`User with id: ${id} not found`]);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
