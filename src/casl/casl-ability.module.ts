import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslAbilityModule {}
