import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all invoices
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("client_id");

    let query = `
      SELECT 
        i.*,
        cc.name as client_name,
        d.deal_name,
        (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM payments p
          WHERE p.invoice_id = i.id
        ) as paid_amount
      FROM invoices i
      LEFT JOIN company_clients cc ON i.company_client_id = cc.id
      LEFT JOIN deals d ON i.deal_id = d.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (clientId) {
      query += ` AND i.company_client_id = $${paramCount}`;
      values.push(clientId);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC`;

    const invoices = await sql(query, values);

    return Response.json({ invoices });
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new invoice with installments
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
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      invoice_number,
      deal_id,
      company_client_id,
      issue_date,
      due_date,
      total_amount,
      currency,
      notes,
      installments, // Array of { installment_number, due_date, amount }
    } = body;

    // Validation
    if (
      !invoice_number ||
      !company_client_id ||
      !issue_date ||
      !due_date ||
      !total_amount
    ) {
      return Response.json(
        {
          error: "Invoice number, client, dates, and amount are required",
        },
        { status: 400 },
      );
    }

    // Check if invoice number already exists
    const existing = await sql`
      SELECT id FROM invoices WHERE invoice_number = ${invoice_number} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return Response.json(
        {
          error: "Invoice number already exists",
        },
        { status: 400 },
      );
    }

    // Validate installments if provided
    if (installments && installments.length > 0) {
      const installmentTotal = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.amount || 0),
        0,
      );
      if (Math.abs(installmentTotal - parseFloat(total_amount)) > 0.01) {
        return Response.json(
          {
            error: "Installment amounts must sum to total invoice amount",
          },
          { status: 400 },
        );
      }
    }

    // Use transaction to create invoice and installments together
    const [invoice] = await sql.transaction([
      sql`
        INSERT INTO invoices (
          invoice_number, deal_id, company_client_id, issue_date, due_date,
          total_amount, currency, notes, status
        )
        VALUES (
          ${invoice_number},
          ${deal_id || null},
          ${company_client_id},
          ${issue_date},
          ${due_date},
          ${total_amount},
          ${currency || "USD"},
          ${notes || null},
          'draft'
        )
        RETURNING *
      `,
    ]);

    // Create installments if provided
    if (installments && installments.length > 0) {
      for (const inst of installments) {
        await sql`
          INSERT INTO invoice_installments (
            invoice_id, installment_number, due_date, amount, status
          )
          VALUES (
            ${invoice[0].id},
            ${inst.installment_number},
            ${inst.due_date},
            ${inst.amount},
            'pending'
          )
        `;
      }
    }

    return Response.json({ invoice: invoice[0] });
  } catch (err) {
    console.error("POST /api/invoices error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
