/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaClient } from '@prisma/client';

export function IsValidSubject(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSubject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const prismaModels = Object.keys(new PrismaClient())
            .filter(
              (key) => typeof new PrismaClient()[key]?.count === 'function',
            )
            .map((key) => key.toLowerCase());

          return value === 'all' || prismaModels.includes(value.toLowerCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Prisma model name or 'all'`;
        },
      },
    });
  };
}
