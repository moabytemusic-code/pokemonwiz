import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const postgres = require('postgres');
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export default db;
