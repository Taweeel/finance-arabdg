import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all subscriptions
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = `
      SELECT * FROM subscription_expenses
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY next_billing_date ASC`;

    const subscriptions = await sql(query, values);

    return Response.json({ subscriptions });
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new subscription
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      provider,
      amount,
      currency,
      billing_cycle,
      next_billing_date,
      status
    } = body;

    if (!name || !amount) {
      return Response.json({ error: "Name and amount are required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO subscription_expenses (
        name, provider, amount, currency, billing_cycle, next_billing_date, status
      )
      VALUES (
        ${name},
        ${provider || null},
        ${amount},
        ${currency || 'USD'},
        ${billing_cycle || 'monthly'},
        ${next_billing_date || null},
        ${status || 'active'}
      )
      RETURNING *
    `;

    return Response.json({ subscription: result[0] });
  } catch (err) {
    console.error("POST /api/subscriptions error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
