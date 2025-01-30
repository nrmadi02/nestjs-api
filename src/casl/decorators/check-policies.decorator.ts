/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../casl-ability.factory';
import { Action } from '@prisma/client';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policies';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

export class ReadUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.READ, 'User');
  }
}
