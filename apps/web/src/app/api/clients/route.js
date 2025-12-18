// apps/web/src/app/api/clients/route.js
import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth?.();
    if (!session) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    
    // Use template literals for proper interpolation
    let baseQuery = sql`SELECT * FROM company_clients WHERE active = true`;
    let finalQuery = baseQuery;
    let values = [];
    
    if (search) {
      const searchPattern = `%${search}%`;
      finalQuery = sql`SELECT * FROM company_clients WHERE active = true AND (
        LOWER(name) LIKE LOWER(${searchPattern}) OR 
        LOWER(legal_name) LIKE LOWER(${searchPattern}) OR 
        LOWER(contact_person_email) LIKE LOWER(${searchPattern})
      ) ORDER BY created_at DESC`;
    } else {
      finalQuery = sql`SELECT * FROM company_clients WHERE active = true ORDER BY created_at DESC`;
    }
    
    const clients = await finalQuery;
    return Response.json({ clients });
  } catch (err) {
    console.error('GET /api/clients error', err);
    // Include error details in dev
    const errorResponse = { 
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    };
    return Response.json(errorResponse, { status: 500 });
  }
}

export async function POST(request) {
  const requestId = request.headers.get('x-request-id') || Math.random().toString(36).slice(2);
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check role (admin or finance_manager)
    const roleRow = await sql`SELECT r.role FROM users_extended u JOIN users_extended r ON u.id = r.id WHERE u.auth_user_id = ${session.user?.id} LIMIT 1`;
    const role = roleRow?.[0]?.role || null;
    if (!(role === 'admin' || role === 'finance_manager')) {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, legal_name, tax_number, address, contact_person_name, contact_person_email, phone, notes } = body;

    // Validation
    const errors = {};
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Client name is required';
    }
    if (Object.keys(errors).length > 0) {
      return Response.json({ message: 'Validation failed', errors }, { status: 422 });
    }

    // Check duplicates
    const dup = await sql`SELECT 1 FROM company_clients WHERE name = ${name.trim()} OR tax_number = ${tax_number ?? null} LIMIT 1`;
    if (dup?.length > 0) {
      return Response.json({ message: 'Duplicate client', errors: { name: 'exists', tax_number: 'exists' } }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO company_clients (
        name, legal_name, tax_number, address, contact_person_name, contact_person_email, phone, notes, active
      ) VALUES (
        ${name.trim()}, ${legal_name ?? null}, ${tax_number ?? null}, ${address ?? null}, ${contact_person_name ?? null}, ${contact_person_email ?? null}, ${phone ?? null}, ${notes ?? null}, true
      ) RETURNING *
    `;

    return Response.json({ client: result[0] }, { status: 201 });
  } catch (err) {
    console.error('POST /api/clients error', err, { requestId });
    if (err?.code === '23505') {
      return Response.json({ message: 'Duplicate client', errors: { field: 'duplicate' } }, { status: 409 });
    }
    if (err?.code === '23502' || err?.code === '23503') {
      return Response.json({ message: 'Validation error', errors: { db: err.message } }, { status: 400 });
    }
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

