import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single client
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const clients = await sql`
      SELECT * FROM company_clients WHERE id = ${id} LIMIT 1
    `;

    if (!clients || clients.length === 0) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ client: clients[0] });
  } catch (err) {
    console.error("GET /api/clients/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update client
export async function PUT(request, { params }) {
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
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
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
      active,
    } = body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined && name.trim().length > 0) {
      updates.push(`name = $${paramCount}`);
      values.push(name.trim());
      paramCount++;
    }

    if (legal_name !== undefined) {
      updates.push(`legal_name = $${paramCount}`);
      values.push(legal_name || null);
      paramCount++;
    }

    if (tax_number !== undefined) {
      updates.push(`tax_number = $${paramCount}`);
      values.push(tax_number || null);
      paramCount++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      values.push(address || null);
      paramCount++;
    }

    if (contact_person_name !== undefined) {
      updates.push(`contact_person_name = $${paramCount}`);
      values.push(contact_person_name || null);
      paramCount++;
    }

    if (contact_person_email !== undefined) {
      updates.push(`contact_person_email = $${paramCount}`);
      values.push(contact_person_email || null);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone || null);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes || null);
      paramCount++;
    }

    if (typeof active === "boolean") {
      updates.push(`active = $${paramCount}`);
      values.push(active);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE company_clients 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);
    const result = await sql(query, values);

    if (!result || result.length === 0) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ client: result[0] });
  } catch (err) {
    console.error("PUT /api/clients/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete (soft delete) client
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const profile = await sql`
      SELECT role FROM users_extended WHERE auth_user_id = ${session.user.id} LIMIT 1
    `;

    if (!profile[0] || profile[0].role !== "admin") {
      return Response.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = params;

    const result = await sql`
      UPDATE company_clients 
      SET active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ message: "Client deactivated successfully" });
  } catch (err) {
    console.error("DELETE /api/clients/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
