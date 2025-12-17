import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List all payroll runs
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payrollRuns = await sql`
      SELECT 
        pr.*,
        ue.full_name as created_by_name,
        (SELECT COUNT(*) FROM payroll_items pi WHERE pi.payroll_run_id = pr.id) as item_count,
        (SELECT COALESCE(SUM(pi.net_salary), 0) FROM payroll_items pi WHERE pi.payroll_run_id = pr.id) as total_net_salary
      FROM payroll_runs pr
      LEFT JOIN users_extended ue ON pr.created_by_user_id = ue.id
      ORDER BY pr.year DESC, pr.month DESC, pr.created_at DESC
    `;

    return Response.json({ payrollRuns });
  } catch (err) {
    console.error("GET /api/payroll error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new payroll run
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
    const { month, year, run_date } = body;

    // Validation
    if (!month || !year || !run_date) {
      return Response.json(
        {
          error: "Month, year, and run date are required",
        },
        { status: 400 },
      );
    }

    if (month < 1 || month > 12) {
      return Response.json({ error: "Invalid month" }, { status: 400 });
    }

    // Check if payroll run already exists for this month/year
    const existing = await sql`
      SELECT id FROM payroll_runs 
      WHERE month = ${month} AND year = ${year}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return Response.json(
        {
          error: "Payroll run already exists for this month/year",
        },
        { status: 400 },
      );
    }

    // Create payroll run
    const runResult = await sql`
      INSERT INTO payroll_runs (month, year, run_date, created_by_user_id, status)
      VALUES (${month}, ${year}, ${run_date}, ${profile[0].id}, 'draft')
      RETURNING *
    `;

    const payrollRunId = runResult[0].id;

    // Get all active employees
    const employees = await sql`
      SELECT id, full_name, base_salary
      FROM employees
      WHERE active = true AND base_salary IS NOT NULL
    `;

    // Create payroll items for each employee
    for (const employee of employees) {
      const grossSalary = parseFloat(employee.base_salary || 0);
      const allowances = 0; // Can be customized
      const deductions = 0; // Can be customized
      const netSalary = grossSalary + allowances - deductions;

      await sql`
        INSERT INTO payroll_items (
          payroll_run_id, employee_id, gross_salary, allowances, deductions, net_salary, payment_status
        )
        VALUES (
          ${payrollRunId},
          ${employee.id},
          ${grossSalary},
          ${allowances},
          ${deductions},
          ${netSalary},
          'pending'
        )
      `;
    }

    return Response.json({
      payrollRun: runResult[0],
      employeesIncluded: employees.length,
    });
  } catch (err) {
    console.error("POST /api/payroll error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
