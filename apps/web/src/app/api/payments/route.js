import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all payments
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoice_id");

    let query = `
      SELECT 
        p.*,
        i.invoice_number,
        cc.name as client_name,
        ue.full_name as recorded_by_name,
        ii.installment_number
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN company_clients cc ON i.company_client_id = cc.id
      LEFT JOIN users_extended ue ON p.recorded_by_user_id = ue.id
      LEFT JOIN invoice_installments ii ON p.installment_id = ii.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (invoiceId) {
      query += ` AND p.invoice_id = $${paramCount}`;
      values.push(invoiceId);
      paramCount++;
    }

    query += ` ORDER BY p.payment_date DESC, p.created_at DESC`;

    const payments = await sql(query, values);

    return Response.json({ payments });
  } catch (err) {
    console.error("GET /api/payments error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Record new payment and auto-update invoice/installment status
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
      invoice_id,
      installment_id,
      payment_date,
      amount,
      payment_method,
      reference_number,
      notes,
    } = body;

    // Validation
    if (!invoice_id || !payment_date || !amount) {
      return Response.json(
        {
          error: "Invoice, payment date, and amount are required",
        },
        { status: 400 },
      );
    }

    // Get invoice details
    const invoices = await sql`
      SELECT total_amount, 
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = ${invoice_id}) as paid_so_far
      FROM invoices 
      WHERE id = ${invoice_id}
      LIMIT 1
    `;

    if (!invoices || invoices.length === 0) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoices[0];
    const newTotalPaid = parseFloat(invoice.paid_so_far) + parseFloat(amount);

    // Insert payment
    const paymentResult = await sql`
      INSERT INTO payments (
        invoice_id, installment_id, payment_date, amount,
        payment_method, reference_number, notes, recorded_by_user_id
      )
      VALUES (
        ${invoice_id},
        ${installment_id || null},
        ${payment_date},
        ${amount},
        ${payment_method || null},
        ${reference_number || null},
        ${notes || null},
        ${profile[0].id}
      )
      RETURNING *
    `;

    // Update installment status if installment_id is provided
    if (installment_id) {
      const installments = await sql`
        SELECT amount, 
          (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.installment_id = ${installment_id}) as installment_paid
        FROM invoice_installments
        WHERE id = ${installment_id}
        LIMIT 1
      `;

      if (installments && installments.length > 0) {
        const installment = installments[0];
        const installmentTotalPaid = parseFloat(installment.installment_paid);

        if (installmentTotalPaid >= parseFloat(installment.amount)) {
          await sql`
            UPDATE invoice_installments
            SET status = 'paid', paid_at = CURRENT_TIMESTAMP
            WHERE id = ${installment_id}
          `;
        }
      }
    }

    // Auto-update invoice status based on total paid
    let newInvoiceStatus = "issued";

    if (newTotalPaid >= parseFloat(invoice.total_amount)) {
      newInvoiceStatus = "paid";
    } else if (newTotalPaid > 0) {
      newInvoiceStatus = "partially_paid";
    }

    await sql`
      UPDATE invoices
      SET status = ${newInvoiceStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoice_id}
    `;

    return Response.json({
      payment: paymentResult[0],
      invoice_status_updated: newInvoiceStatus,
    });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
