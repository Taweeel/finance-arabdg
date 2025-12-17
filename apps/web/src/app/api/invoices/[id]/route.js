import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single invoice with installments
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get invoice
    const invoices = await sql`
      SELECT 
        i.*,
        cc.name as client_name,
        cc.legal_name as client_legal_name,
        cc.address as client_address,
        cc.tax_number as client_tax_number,
        d.deal_name,
        (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM payments p
          WHERE p.invoice_id = i.id
        ) as paid_amount
      FROM invoices i
      LEFT JOIN company_clients cc ON i.company_client_id = cc.id
      LEFT JOIN deals d ON i.deal_id = d.id
      WHERE i.id = ${id}
      LIMIT 1
    `;

    if (!invoices || invoices.length === 0) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get installments
    const installments = await sql`
      SELECT * FROM invoice_installments
      WHERE invoice_id = ${id}
      ORDER BY installment_number ASC
    `;

    // Get payments
    const payments = await sql`
      SELECT 
        p.*,
        ue.full_name as recorded_by_name
      FROM payments p
      LEFT JOIN users_extended ue ON p.recorded_by_user_id = ue.id
      WHERE p.invoice_id = ${id}
      ORDER BY p.payment_date DESC
    `;

    return Response.json({
      invoice: invoices[0],
      installments,
      payments,
    });
  } catch (err) {
    console.error("GET /api/invoices/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update invoice status
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
    const { status, notes } = body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE invoices 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);
    const result = await sql(query, values);

    if (!result || result.length === 0) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    return Response.json({ invoice: result[0] });
  } catch (err) {
    console.error("PUT /api/invoices/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
