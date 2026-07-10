export const postgresEnvironment = connectionString => {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL PostgreSQL inválida.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL PostgreSQL inválida.');
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!url.hostname || !database) throw new Error('DATABASE_URL PostgreSQL inválida.');

  return {
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    ...(url.username ? {PGUSER: decodeURIComponent(url.username)} : {}),
    ...(url.password ? {PGPASSWORD: decodeURIComponent(url.password)} : {}),
    PGDATABASE: database,
    ...(url.searchParams.get('sslmode') ? {PGSSLMODE: url.searchParams.get('sslmode')} : {}),
  };
};
