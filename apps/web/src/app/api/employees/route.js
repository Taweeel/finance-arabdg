import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all employees
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    let query = `
      SELECT e.*, ue.role as user_role
      FROM employees e
      LEFT JOIN users_extended ue ON e.user_id = ue.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (active !== null) {
      query += ` AND e.active = $${paramCount}`;
      values.push(active === "true");
      paramCount++;
    }

    query += ` ORDER BY e.created_at DESC`;

    const employees = await sql(query, values);

    return Response.json({ employees });
  } catch (err) {
    console.error("GET /api/employees error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new employee
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
      user_id,
      full_name,
      email,
      position,
      department,
      base_salary,
      currency,
      hire_date,
    } = body;

    // Validation
    if (!full_name || !email) {
      return Response.json(
        {
          error: "Full name and email are required",
        },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM employees WHERE email = ${email} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return Response.json(
        {
          error: "Employee with this email already exists",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO employees (
        user_id, full_name, email, position, department,
        base_salary, currency, hire_date, active
      )
      VALUES (
        ${user_id || null},
        ${full_name},
        ${email},
        ${position || null},
        ${department || null},
        ${base_salary || null},
        ${currency || "USD"},
        ${hire_date || null},
        true
      )
      RETURNING *
    `;

    return Response.json({ employee: result[0] });
  } catch (err) {
    console.error("POST /api/employees error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
