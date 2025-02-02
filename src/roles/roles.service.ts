import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaQueryHelperService } from 'src/prisma/query-helper.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/users/dto/user.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectPinoLogger(RolesService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly queryHelper: PrismaQueryHelperService,
  ) {}

  extendedPrisma = this.prisma.$extends(this.queryHelper.softDeleteExtension);

  async create(data: CreateRoleDto): Promise<RoleDto> {
    this.logger.info('Create role');

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissions.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return role;
  }

  async findAll(): Promise<RoleDto[]> {
    this.logger.info('Find all roles');

    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    });

    return roles;
  }

  async findOne(id: number): Promise<RoleDto> {
    this.logger.info('Find one role');

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(['Role not found']);
    }

    return role;
  }

  async update(id: number, data: UpdateRoleDto): Promise<RoleDto> {
    this.logger.info('Update role');

    await this.findOne(id);

    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissions?.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return role;
  }

  async remove(id: number): Promise<boolean> {
    this.logger.info('Remove role');
    await this.findOne(id);
    await this.prisma.role.delete({
      where: { id },
    });
    return true;
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<RoleDto> {
    this.logger.info('Assign permissions to role');
    await this.findOne(roleId);
    const role = this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
    return role;
  }

  async assignToUser(userId: number, roleId: number): Promise<UserDto> {
    this.logger.info('Assign role to user');

    await this.userService.findOne(userId);
    await this.findOne(roleId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: {
          connect: {
            id: roleId,
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
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
          include: {
            permissions: true,
          },
        },
      },
    });

    return updatedUser;
  }
}
