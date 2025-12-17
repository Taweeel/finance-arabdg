import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all petty cash transactions
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = `
      SELECT 
        pc.*,
        ue.full_name as recorded_by_name
      FROM petty_cash pc
      LEFT JOIN users_extended ue ON pc.recorded_by_user_id = ue.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND pc.date >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND pc.date <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY pc.date DESC, pc.created_at DESC`;

    const transactions = await sql(query, values);

    // Calculate current balance
    const balanceResult = await sql`
      SELECT 
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END) as balance
      FROM petty_cash
    `;

    const balance = balanceResult[0]?.balance || 0;

    return Response.json({ transactions, balance });
  } catch (err) {
    console.error("GET /api/petty-cash error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new transaction
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM users_extended WHERE auth_user_id = ${session.user.id} LIMIT 1
    `;
    const userId = userResult[0]?.id;

    const body = await request.json();
    const { amount, type, description, date } = body;

    if (!amount || !type) {
      return Response.json({ error: "Amount and type are required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO petty_cash (
        amount, type, description, date, recorded_by_user_id
      )
      VALUES (
        ${amount},
        ${type},
        ${description || null},
        ${date || new Date().toISOString()},
        ${userId}
      )
      RETURNING *
    `;

    return Response.json({ transaction: result[0] });
  } catch (err) {
    console.error("POST /api/petty-cash error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
