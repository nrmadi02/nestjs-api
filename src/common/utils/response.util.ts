import { PaginationMeta } from '../dtos/api-response.dto';

export const SucessResponse = <T>(
  message: string = 'Success',
  statusCode: number = 200,
  data: T,
  meta?: PaginationMeta,
) => {
  return { success: true, statusCode, message, data, meta };
};
