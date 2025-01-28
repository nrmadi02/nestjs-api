export default () => ({
  port: parseInt(process.env.PORT ?? '0', 10) || 3000,
  database: {
    databaseUrl: process.env.DATABASE_URL,
  },
  logtail: {
    sourceToken: process.env.LOGTAIL_SOURCE_TOKEN || '',
  },
});
