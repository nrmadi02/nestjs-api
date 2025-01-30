import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';

@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityFactory, PoliciesGuard],
  exports: [CaslAbilityFactory, PoliciesGuard],
})
export class CaslAbilityModule {}
