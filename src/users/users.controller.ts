import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { SucessResponse } from 'src/common/utils/response.util';
import { IUser } from './entities/user.entity';
import { ApiCreatedResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
