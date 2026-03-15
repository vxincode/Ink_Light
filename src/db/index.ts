import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Client for queries
const client = postgres(connectionString, { prepare: false })

// @ts-ignore - Type mismatch between postgres and drizzle versions
export const db = drizzle(client, { schema })
