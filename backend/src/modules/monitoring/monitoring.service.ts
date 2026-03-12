import { Pool } from 'pg';
import * as dbRepository from '../database/database.repository';
import * as dockerService from '../docker/docker.service';

export interface DatabaseMetrics {
  database_size: string;
  active_connections: number;
  container_status: string;
  container_running: boolean;
  started_at: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default_value: string | null;
  is_primary: boolean;
}

export interface IndexInfo {
  name: string;
  definition: string;
}

export interface TableSchema {
  name: string;
  row_count: number;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

export interface DatabaseSchema {
  tables: TableSchema[];
}

/**
 * Get metrics for a provisioned database.
 */
export async function getMetrics(databaseId: string, userId: string, role: string): Promise<DatabaseMetrics> {
  const db = await dbRepository.findById(databaseId);
  if (!db) throw new Error('Database not found');
  if (db.owner_id !== userId && role !== 'admin') throw new Error('You do not have permission to view this database');

  let containerInfo = { status: 'unknown', running: false, startedAt: '' };
  if (db.container_id) containerInfo = await dockerService.inspectContainer(db.container_id);

  let dbSize = 'N/A';
  let activeConnections = 0;

  if (containerInfo.running) {
    const tempPool = new Pool({
      host: 'localhost',
      port: db.port,
      database: db.name,
      user: db.username,
      password: db.password,
      connectionTimeoutMillis: 5000,
    });
    try {
      const sizeResult = await tempPool.query(`SELECT pg_size_pretty(pg_database_size($1)) as size`, [db.name]);
      dbSize = sizeResult.rows[0]?.size || 'N/A';
      const connResult = await tempPool.query(`SELECT count(*) as count FROM pg_stat_activity WHERE datname = $1`, [db.name]);
      activeConnections = parseInt(connResult.rows[0]?.count || '0', 10);
    } catch (error: any) {
      console.error(`Failed to query metrics for ${db.name}:`, error.message);
    } finally {
      await tempPool.end();
    }
  }

  return {
    database_size: dbSize,
    active_connections: activeConnections,
    container_status: containerInfo.status,
    container_running: containerInfo.running,
    started_at: containerInfo.startedAt,
  };
}

/**
 * Get the full schema (tables, columns, indexes) of a provisioned database.
 */
export async function getSchema(databaseId: string, userId: string, role: string): Promise<DatabaseSchema> {
  const db = await dbRepository.findById(databaseId);
  if (!db) throw new Error('Database not found');
  if (db.owner_id !== userId && role !== 'admin') throw new Error('You do not have permission to view this database');

  const tempPool = new Pool({
    host: 'localhost',
    port: db.port,
    database: db.name,
    user: db.username,
    password: db.password,
    connectionTimeoutMillis: 5000,
  });

  try {
    // Get all user-created tables (excluding pg_ system tables)
    const tablesResult = await tempPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables: TableSchema[] = await Promise.all(
      tablesResult.rows.map(async (row: any) => {
        const tableName: string = row.table_name;

        // Fetch columns
        const columnsResult = await tempPool.query(`
          SELECT
            c.column_name AS name,
            c.data_type   AS type,
            c.is_nullable = 'YES' AS nullable,
            c.column_default      AS default_value,
            EXISTS (
              SELECT 1 FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
              WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_name = c.table_name
                AND tc.table_schema = c.table_schema
                AND kcu.column_name = c.column_name
            ) AS is_primary
          FROM information_schema.columns c
          WHERE c.table_schema = 'public'
            AND c.table_name = $1
          ORDER BY c.ordinal_position
        `, [tableName]);

        // Fetch indexes
        const indexesResult = await tempPool.query(`
          SELECT indexname AS name, indexdef AS definition
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = $1
          ORDER BY indexname
        `, [tableName]);

        // Fetch approximate row count
        const countResult = await tempPool.query(`
          SELECT reltuples::bigint AS row_count
          FROM pg_class
          WHERE relname = $1
        `, [tableName]);

        return {
          name: tableName,
          row_count: Number(countResult.rows[0]?.row_count ?? 0),
          columns: columnsResult.rows.map((c: any) => ({
            name: c.name,
            type: c.type,
            nullable: c.nullable,
            default_value: c.default_value ?? null,
            is_primary: c.is_primary,
          })),
          indexes: indexesResult.rows.map((idx: any) => ({
            name: idx.name,
            definition: idx.definition,
          })),
        };
      })
    );

    return { tables };
  } catch (error: any) {
    throw new Error(`Failed to fetch schema: ${error.message}`);
  } finally {
    await tempPool.end();
  }
}
