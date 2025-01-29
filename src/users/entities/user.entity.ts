import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class IUser implements Omit<User, 'password'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;
}
