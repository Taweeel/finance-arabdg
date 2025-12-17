import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_xDHUja1XV4Po@ep-broad-sky-ag579c4z-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function checkUsers() {
  try {
    const authUsers = await sql`SELECT id, name, email FROM auth_users`;
    console.log('Auth users:', authUsers);
    
    const usersExtended = await sql`SELECT * FROM users_extended`;
    console.log('Users extended:', usersExtended);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();