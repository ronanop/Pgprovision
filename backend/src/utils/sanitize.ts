/**
 * Sanitize a database name to allow only lowercase letters, numbers, and underscores.
 */
export function sanitizeDatabaseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Validate that a database name matches the allowed pattern.
 */
export function isValidDatabaseName(name: string): boolean {
  return /^[a-z0-9_]{1,63}$/.test(name);
}

/**
 * Generate a database name from project name and environment.
 */
export function generateDatabaseName(projectName: string, environment: string): string {
  const sanitizedProject = sanitizeDatabaseName(projectName);
  const sanitizedEnv = sanitizeDatabaseName(environment);
  return `${sanitizedProject}_${sanitizedEnv}`;
}

/**
 * Generate a database username from the project name.
 */
export function generateDatabaseUser(projectName: string): string {
  const sanitized = sanitizeDatabaseName(projectName);
  return `${sanitized}_user`;
}
