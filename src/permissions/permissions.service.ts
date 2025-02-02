import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaQueryHelperService } from 'src/prisma/query-helper.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectPinoLogger(PermissionsService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly queryHelper: PrismaQueryHelperService,
  ) {}

  extendedPrisma = this.prisma.$extends(this.queryHelper.softDeleteExtension);

  async findAll(): Promise<PermissionDto[]> {
    this.logger.info('Find all permissions');
    const permissions = await this.prisma.permission.findMany();
    return permissions;
  }

  async findByIds(ids: number[]): Promise<PermissionDto[]> {
    this.logger.info('Find permissions by ids');
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return permissions;
  }

  async findOne(id: number): Promise<PermissionDto> {
    this.logger.info('Find one permission');
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(['Permission not found']);
    }
    return permission;
  }

  async create(dto: CreatePermissionDto): Promise<PermissionDto> {
    this.logger.info('Create permission');
    const permission = await this.prisma.permission.findUnique({
      where: {
        action_subject: {
          subject: dto.subject,
          action: dto.action,
        },
      },
    });

    if (permission) {
      throw new NotFoundException(['Permission already exists']);
    }

    const newPermission = await this.prisma.permission.create({
      data: {
        action: dto.action,
        subject: dto.subject,
        conditions: dto.conditions,
        reason: dto.reason,
      },
    });
    return newPermission;
  }

  async update(id: number, dto: CreatePermissionDto): Promise<PermissionDto> {
    this.logger.info('Update permission');
    await this.findOne(id);
    const permission = await this.prisma.permission.update({
      where: { id },
      data: {
        action: dto.action,
        subject: dto.subject,
        conditions: dto.conditions,
        reason: dto.reason,
      },
    });
    return permission;
  }

  async delete(id: number): Promise<boolean> {
    this.logger.info('Delete permission');
    await this.findOne(id);
    await this.prisma.permission.delete({
      where: { id },
    });
    return true;
  }
}
