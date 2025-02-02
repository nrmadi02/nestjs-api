import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { Action } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidSubject } from '../decorators/validate-subject.decorator';
import { Subjects } from 'src/casl/casl-ability.factory';

export class CreatePermissionDto {
  @IsEnum(Action)
  @ApiProperty({ enum: Action })
  action: Action;

  @IsString()
  @ApiProperty({
    type: String,
  })
  @IsValidSubject()
  subject: Subjects;

  @IsObject()
  @IsOptional()
  @ApiProperty()
  conditions?: Record<string, any>;

  @IsString()
  @IsOptional()
  @ApiProperty()
  reason?: string;
}
