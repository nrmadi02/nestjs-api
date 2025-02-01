import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { SucessResponse } from 'src/common/utils/response.util';
import { IUser } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Roles } from 'src/auth/decorators/role-decorator';

@ApiTags('[ADMIN] Users')
@Controller('users')
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard, PoliciesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'User'))
  @ApiOperation({ summary: 'Create user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(IUser)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
  })
  @ApiCreatedResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(ApiResponse) }],
      properties: { data: { $ref: getSchemaPath(IUser) } },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return SucessResponse('Success to create user', 201, user);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(IUser, true)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
  })
  async findAll(@Query() query: UserQueryDto) {
    const { data, meta } = await this.usersService.findAll(query);
    return SucessResponse('Success to get all users', 200, data, meta);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
  @ApiOperation({ summary: 'Get user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(IUser)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
  })
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    return SucessResponse('Success to get user', 200, user);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'User'))
  @ApiOperation({ summary: 'Update user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(IUser)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
  })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return SucessResponse('Success to update user', 200, user);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'User'))
  @ApiOperation({ summary: 'Remove user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(IUser)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
  })
  async remove(@Param('id') id: number) {
    await this.usersService.remove(id);
    return SucessResponse('Success to remove user', 200, true);
  }
}
