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
import { UserQueryDto } from './dto/user-query.dto';
import { hash } from 'crypto';
import { IUser } from './entities/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
  ) {}

  private hashPassword(password: string): string {
    return hash('sha256', password).toString();
  }

  private buildUserFilterConditions(
    query: UserQueryDto,
  ): Prisma.UserWhereInput {
    const whereCondition: Prisma.UserWhereInput = {};

    if (query.email) {
      whereCondition.email = {
        contains: query.email,
        mode: 'insensitive',
      };
    }

    if (query.username) {
      whereCondition.username = {
        contains: query.username,
        mode: 'insensitive',
      };
    }

    return whereCondition;
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    this.logger.info('Create user');

    const password = this.hashPassword(createUserDto.password);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return user;
  }

  async findAll(query: UserQueryDto): Promise<PaginateOutput<IUser>> {
    this.logger.info('Get all users');

    const filter = this.buildUserFilterConditions(query);
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: filter,
        ...paginate({
          page: query.page,
          size: query.size,
        }),
        select: {
          id: true,
          email: true,
          username: true,
        },
      }),
      this.prisma.user.count({
        where: filter,
      }),
    ]);

    return paginateOutput<IUser>(users, total, {
      page: query.page,
      size: query.size,
    });
  }

  async findOne(id: number): Promise<IUser | null> {
    this.logger.info(`Get user with id: ${id}`);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true },
    });
    if (!user) {
      throw new NotFoundException([`User with id: ${id} not found`]);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<IUser> {
    this.logger.info(`Update user with id: ${id}`);

    const updateUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return updateUser;
  }

  async remove(id: number): Promise<boolean> {
    this.logger.info(`Remove user with id: ${id}`);

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException([`User with id: ${id} not found`]);
    }

    await this.prisma.user.delete({ where: { id } });

    return true;
  }
}
