import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';

export class TokensDto {
  @ApiProperty({ type: String })
  accessToken: string;

  @ApiProperty({ type: String })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: OmitType(UserDto, ['createdAt', 'updatedAt']) })
  user: Omit<UserDto, 'createdAt' | 'updatedAt'>;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;
}
