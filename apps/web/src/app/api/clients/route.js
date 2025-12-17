import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all clients with optional search
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = `
      SELECT * FROM company_clients 
      WHERE active = true
    `;
    const values = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramCount}) 
        OR LOWER(legal_name) LIKE LOWER($${paramCount})
        OR LOWER(contact_person_email) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const clients = await sql(query, values);

    return Response.json({ clients });
  } catch (err) {
    console.error("GET /api/clients error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new client
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const profile = await sql`
      SELECT role FROM users_extended WHERE auth_user_id = ${session.user.id} LIMIT 1
    `;

    if (
      !profile[0] ||
      !["admin", "finance_manager"].includes(profile[0].role)
    ) {
      return Response.json(
        { error: "Forbidden - Admin or Finance Manager access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      legal_name,
      tax_number,
      address,
      contact_person_name,
      contact_person_email,
      phone,
      notes,
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return Response.json(
        { error: "Client name is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO company_clients (
        name, legal_name, tax_number, address, 
        contact_person_name, contact_person_email, phone, notes, active
      )
      VALUES (
        ${name.trim()},
        ${legal_name || null},
        ${tax_number || null},
        ${address || null},
        ${contact_person_name || null},
        ${contact_person_email || null},
        ${phone || null},
        ${notes || null},
        true
      )
      RETURNING *
    `;

    return Response.json({ client: result[0] });
  } catch (err) {
    console.error("POST /api/clients error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
