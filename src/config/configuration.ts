export default () => ({
  port: parseInt(process.env.PORT ?? '0', 10) || 3000,
  database: {
    databaseUrl: process.env.DATABASE_URL,
  },
  logtail: {
    sourceToken: process.env.LOGTAIL_SOURCE_TOKEN || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    resetPasswordExpiresIn: process.env.JWT_RESET_PASSWORD_EXPIRATION || '15m',
    verificationExpiresIn: process.env.JWT_VERIFICATION_EXPIRATION || '15m',
  },
});
