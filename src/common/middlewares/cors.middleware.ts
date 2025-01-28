import { FastifyReply, FastifyRequest } from 'fastify';

export const corsMiddleware = (
  _req: FastifyRequest['raw'],
  res: FastifyReply['raw'],
  next: () => void,
) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
};
