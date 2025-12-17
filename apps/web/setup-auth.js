import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAuthTables() {
  const databaseUrl = 'postgresql://neondb_owner:npg_xDHUja1XV4Po@ep-broad-sky-ag579c4z-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const sql = neon(databaseUrl);

  try {
    console.log('Setting up auth tables...');
    
    const authSchemaPath = path.join(__dirname, 'database/auth-schema.sql');
    const authSchemaSql = fs.readFileSync(authSchemaPath, 'utf8');
    
    // Remove comments and split into statements
    const cleaned = authSchemaSql
      .replace(/--.*$/gm, '')
      .replace(/\r/g, '');

    const statements = cleaned
      .split(/;\s*(?:\r?\n|$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await sql(stmt);
    }

    console.log('✅ Auth tables created successfully!');
    
    // Check if we need to create an admin user
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users_extended`;
    if (existingUsers[0].count === 0) {
      console.log('No users found. Please sign up first, then run create-admin.js');
    }
    
  } catch (error) {
    console.error('❌ Error creating auth tables:', error);
  }
}

setupAuthTables();