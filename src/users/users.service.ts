import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  paginate,
  paginateOutput,
  PaginateOutput,
} from 'src/common/utils/pagination.util';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcrypt';
import { IUser } from './entities/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
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

    const { email, username, roleId } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(['Email or username already exists']);
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        roleId,
        password: hashedPassword,
        profile: {
          create: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            phoneNumber: createUserDto.phoneNumber,
          },
        },
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        role: true,
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
          uuid: true,
          username: true,
          email: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
          role: true,
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

  async findOne(id: number): Promise<IUser> {
    this.logger.info(`Get user with id: ${id}`);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException([`User with id: ${id} not found`]);
    }

    return user;
  }

  async findByEmail(email: string): Promise<IUser> {
    this.logger.info(`Get user with email: ${email}`);

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException([`User with email: ${email} not found`]);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<IUser> {
    this.logger.info(`Update user with id: ${id}`);

    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            updateUserDto.email ? { email: updateUserDto.email } : {},
            updateUserDto.username ? { username: updateUserDto.username } : {},
          ],
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException(['Email or username already exists']);
      }
    }

    const updateUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        profile: {
          update: {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            phoneNumber: updateUserDto.phoneNumber,
          },
        },
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        role: true,
      },
    });

    return updateUser;
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<boolean> {
    this.logger.info(`Update password for user with id: ${id}`);
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException([`User with ID ${id} not found`]);
    }

    const isPasswordValid = await this.verifyPassword(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException(['Current password is incorrect']);
    }

    const hashedPassword = await this.hashPassword(
      updatePasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
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

  async updateLastLogin(id: number): Promise<IUser> {
    this.logger.info(`Update last login for user with id: ${id}`);
    const user = await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException([`User with id: ${id} not found`]);
    }

    return user;
  }
}
