/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Build MySQL connection URL from env vars.
 * Use DATABASE_URL if set (mysql://...), otherwise build from MYSQL_*.
 */
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const user = encodeURIComponent(process.env.MYSQL_USER || 'root');
  const password = encodeURIComponent(process.env.MYSQL_PASSWORD || '');
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = process.env.MYSQL_PORT || '3306';
  const database = process.env.MYSQL_DATABASE || 'planka';
  const auth = password ? `${user}:${password}` : user;
  return `mysql://${auth}@${host}:${port}/${database}`;
}

module.exports = { getDatabaseUrl };
