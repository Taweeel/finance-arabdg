import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all deals
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");
    const status = searchParams.get("status");

    let query = `
      SELECT d.*, cc.name as client_name, ue.full_name as responsible_person_name
      FROM deals d
      LEFT JOIN company_clients cc ON d.company_client_id = cc.id
      LEFT JOIN users_extended ue ON d.responsible_user_id = ue.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (clientId) {
      query += ` AND d.company_client_id = $${paramCount}`;
      values.push(clientId);
      paramCount++;
    }

    if (status) {
      query += ` AND d.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY d.created_at DESC`;

    const deals = await sql(query, values);

    return Response.json({ deals });
  } catch (err) {
    console.error("GET /api/deals error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new deal
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const profile = await sql`
      SELECT id, role FROM users_extended WHERE auth_user_id = ${session.user.id} LIMIT 1
    `;

    if (
      !profile[0] ||
      !["admin", "finance_manager"].includes(profile[0].role)
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      deal_name,
      description,
      company_client_id,
      total_amount,
      currency,
      start_date,
      end_date,
      payment_terms_text,
      responsible_user_id,
      status,
    } = body;

    // Validation
    if (!deal_name || !company_client_id || !total_amount) {
      return Response.json(
        {
          error: "Deal name, client, and total amount are required",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO deals (
        deal_name, description, company_client_id, total_amount, currency,
        start_date, end_date, payment_terms_text, responsible_user_id, status
      )
      VALUES (
        ${deal_name},
        ${description || null},
        ${company_client_id},
        ${total_amount},
        ${currency || "USD"},
        ${start_date || null},
        ${end_date || null},
        ${payment_terms_text || null},
        ${responsible_user_id || profile[0].id},
        ${status || "ongoing"}
      )
      RETURNING *
    `;

    return Response.json({ deal: result[0] });
  } catch (err) {
    console.error("POST /api/deals error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
