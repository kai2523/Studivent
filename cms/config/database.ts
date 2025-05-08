export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host    : env('DATABASE_HOST'),
      port    : Number(env('DATABASE_PORT')),
      database: env('DATABASE_NAME'),
      user    : env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl     : { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
