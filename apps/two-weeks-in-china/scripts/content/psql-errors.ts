import type { SpawnSyncReturns } from 'node:child_process';

type PsqlFailure = Pick<
  SpawnSyncReturns<string>,
  'error' | 'status' | 'signal' | 'stderr'
>;

/** Classify locally, but never include raw stderr, SQL, URLs or credentials. */
export function describePsqlFailure(result: PsqlFailure): string {
  const code = (result.error as NodeJS.ErrnoException | undefined)?.code;
  switch (code) {
    case 'ENOENT':
      return '[PSQL_NOT_FOUND] psql was not found on PATH. Install libpq 16+ and add its bin directory to PATH in this terminal.';
    case 'EACCES':
      return '[PSQL_NOT_EXECUTABLE] psql could not be executed. Check its executable permissions and installation.';
    case 'ETIMEDOUT':
      return '[PSQL_TIMEOUT] The psql process timed out. Check connectivity to the selected Neon endpoint.';
    case 'ENOBUFS':
      return '[PSQL_OUTPUT_LIMIT] The export exceeded the subprocess output limit. No partial snapshot was saved.';
  }
  if (result.error)
    return '[PSQL_PROCESS_ERROR] psql could not run successfully. Check psql --version and the client installation.';
  if (result.signal)
    return '[PSQL_INTERRUPTED] The psql process was terminated by a signal before export completed.';

  const stderr = result.stderr ?? '';
  if (/library not loaded|error while loading shared libraries/i.test(stderr))
    return '[PSQL_CLIENT_BROKEN] psql could not load a required library. Repair the libpq installation and run psql --version.';
  if (/root certificate file .*system.* does not exist/i.test(stderr))
    return '[PSQL_CLIENT_VERSION] The client treated sslrootcert=system as a filename. Use psql/libpq 16+ and check which psql is first on PATH.';
  if (/certificate|sslrootcert|ssl error|tls error/i.test(stderr))
    return '[PSQL_TLS_ERROR] TLS or certificate verification failed. Check psql/libpq 16+ and its trusted CA certificates (including SSL_CERT_FILE/SSL_CERT_DIR). Do not disable verify-full.';
  if (
    /could not translate host name|name or service not known|nodename nor servname|temporary failure in name resolution/i.test(
      stderr,
    )
  )
    return '[PSQL_DNS_ERROR] The database hostname could not be resolved. Check the connection URL and this terminal\'s DNS/network.';
  if (/password authentication failed|no password supplied|authentication failed/i.test(stderr))
    return '[PSQL_AUTH_ERROR] Database authentication failed. Recheck the selected Neon role and password in CONTENT_DATABASE_URL; do not paste the connection string into logs or chat.';
  if (/database .* does not exist/i.test(stderr))
    return '[PSQL_DATABASE_NOT_FOUND] The selected database does not exist. Check the Neon branch and database selection.';
  if (/relation .* does not exist|column .* does not exist/i.test(stderr))
    return '[PSQL_SCHEMA_MISMATCH] A required table or column is missing. Select the original two-weeks-in-china database with public.pages and public.countries.';
  if (
    /unsupported startup parameter|unsupported .*options|invalid command-line argument for server process/i.test(
      stderr,
    )
  )
    return '[PSQL_STARTUP_OPTIONS] The endpoint rejected connection startup options. Use the Neon direct connection rather than a pooler and retain the read-only settings.';
  if (/permission denied|no pg_hba.conf entry/i.test(stderr))
    return '[PSQL_ACCESS_DENIED] Database access was denied. Check role permissions on public.pages/public.countries and endpoint access restrictions.';
  if (/statement timeout|canceling statement due to/i.test(stderr))
    return '[PSQL_QUERY_TIMEOUT] The database canceled the export query. Check database availability and query duration; no partial snapshot was saved.';
  if (
    /connection refused|timeout expired|connection timed out|network is unreachable|server closed the connection|connection reset|could not connect|could not receive|could not send/i.test(
      stderr,
    )
  )
    return '[PSQL_CONNECTION_ERROR] The connection failed or was interrupted. Check endpoint availability, port access and the terminal network.';
  if (result.status === 3)
    return '[PSQL_QUERY_FAILED] psql stopped on a SQL error. Check the original tables, columns and read permissions in the Neon SQL Editor.';
  return '[PSQL_FAILED] psql exited unsuccessfully for an unclassified reason. Check psql --version and the database connection locally. Raw server output was withheld to protect credentials.';
}
