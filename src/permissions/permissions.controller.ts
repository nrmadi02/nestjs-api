import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role-decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { SucessResponse } from 'src/common/utils/response.util';
import { PermissionsService } from './permissions.service';
import { PermissionDto } from './dto/permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
@Roles('Admin', 'User')
@UseGuards(JwtAuthGuard, RolesGuard, PoliciesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'permission'))
  @ApiOperation({ summary: 'Create a permission' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(PermissionDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  @ApiCreatedResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(ApiResponse) }],
      properties: { data: { $ref: getSchemaPath(PermissionDto) } },
    },
  })
  async create(@Body() permissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(permissionDto);
    return SucessResponse('Success to create role', 201, permission);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'permission'))
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(PermissionDto, true)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return SucessResponse('Success to get all permissions', 200, permissions);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'permission'))
  @ApiOperation({ summary: 'Update a permission' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(PermissionDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async update(
    @Param('id') id: number,
    @Body() permissionDto: CreatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(id, permissionDto);
    return SucessResponse('Success to update role', 200, permission);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'permission'))
  @ApiOperation({ summary: 'Delete a permissions' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async delete(@Param('id') id: number) {
    await this.permissionsService.delete(id);
    return SucessResponse('Success to delete permissions', 200, true);
  }
}
