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
import { RolesService } from './roles.service';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { RoleDto } from './dto/role.dto';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { SucessResponse } from 'src/common/utils/response.util';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permission.dto';

@ApiTags('Roles')
@Controller('roles')
@Roles('Admin', 'User')
@UseGuards(JwtAuthGuard, RolesGuard, PoliciesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'role'))
  @ApiOperation({ summary: 'Create a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto)
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
      properties: { data: { $ref: getSchemaPath(RoleDto) } },
    },
  })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return SucessResponse('Success to create role', 201, role);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'role'))
  @ApiOperation({ summary: 'Get all roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto, true)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async findAll() {
    const roles = await this.rolesService.findAll();
    return SucessResponse('Success to get all roles', 200, roles);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'role'))
  @ApiOperation({ summary: 'Get a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async findOne(@Param('id') id: number) {
    const role = await this.rolesService.findOne(id);
    return SucessResponse('Success to get a role', 200, role);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'role'))
  @ApiOperation({ summary: 'Update a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesService.update(id, updateRoleDto);
    return SucessResponse('Success to update a role', 200, role);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'role'))
  @ApiOperation({ summary: 'Delete a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async remove(@Param('id') id: number) {
    await this.rolesService.remove(id);
    return SucessResponse('Success to delete a role', 200, true);
  }

  @Post('assign/:userId/:roleId')
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('update', 'role') && ability.can('update', 'user'),
  )
  @ApiOperation({ summary: 'Delete a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async assignToUser(
    @Param('userId') userId: number,
    @Param('roleId') roleId: number,
  ) {
    const user = await this.rolesService.assignToUser(userId, roleId);
    return SucessResponse('Success to assign a role to user', 200, user);
  }

  @Patch(':id/permissions')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'role'))
  @ApiOperation({ summary: 'Delete a role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(RoleDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async assignPermissions(
    @Param('id') id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    const role = await this.rolesService.assignPermissions(
      id,
      dto.permissionIds,
    );
    return SucessResponse('Success to assign permissions to role', 200, role);
  }
}
