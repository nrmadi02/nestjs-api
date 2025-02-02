import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse, ApiResponsePaginated } from '../dtos/api-response.dto';

export const ApiResponseDecorator = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false,
  isPaginated: boolean = false,
) => {
  const ResponseClass = isPaginated ? ApiResponsePaginated : ApiResponse;
  return applyDecorators(
    ApiExtraModels(ResponseClass, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseClass) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : {
                    $ref: getSchemaPath(model),
                  },
            },
          },
        ],
      },
    }),
  );
};
