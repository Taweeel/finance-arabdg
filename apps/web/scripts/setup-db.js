import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.error('Please create a .env file with your database connection string.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = neon(databaseUrl);

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema migration...');

    // Remove line comments and split into individual statements
    const cleaned = schemaSql
      .replace(/--.*$/gm, '')
      .replace(/\r/g, '');

    const statements = cleaned
      .split(/;\s*(?:\r?\n|$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Execute statements sequentially (Neon prepared statements do not allow multiple commands at once)
    for (const stmt of statements) {
      await sql(stmt);
    }

    console.log('✅ Database schema applied successfully!');
    
    // Optional: Check if we need to seed initial admin
    // This part is left for the user to handle via the /setup-admin page
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

setupDatabase();
