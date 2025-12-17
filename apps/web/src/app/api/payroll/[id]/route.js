import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get payroll run details with items
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get payroll run
    const runs = await sql`
      SELECT 
        pr.*,
        ue.full_name as created_by_name
      FROM payroll_runs pr
      LEFT JOIN users_extended ue ON pr.created_by_user_id = ue.id
      WHERE pr.id = ${id}
      LIMIT 1
    `;

    if (!runs || runs.length === 0) {
      return Response.json({ error: "Payroll run not found" }, { status: 404 });
    }

    // Get payroll items
    const items = await sql`
      SELECT 
        pi.*,
        e.full_name as employee_name,
        e.position,
        e.department
      FROM payroll_items pi
      LEFT JOIN employees e ON pi.employee_id = e.id
      WHERE pi.payroll_run_id = ${id}
      ORDER BY e.full_name ASC
    `;

    return Response.json({
      payrollRun: runs[0],
      items,
    });
  } catch (err) {
    console.error("GET /api/payroll/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update payroll run status or item
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
      status,
      item_id,
      allowances,
      deductions,
      payment_status,
      payment_date,
      notes,
    } = body;

    // Update payroll run status
    if (status) {
      const result = await sql`
        UPDATE payroll_runs
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (!result || result.length === 0) {
        return Response.json(
          { error: "Payroll run not found" },
          { status: 404 },
        );
      }

      return Response.json({ payrollRun: result[0] });
    }

    // Update payroll item
    if (item_id) {
      // Get current item
      const currentItem = await sql`
        SELECT * FROM payroll_items WHERE id = ${item_id} AND payroll_run_id = ${id} LIMIT 1
      `;

      if (!currentItem || currentItem.length === 0) {
        return Response.json(
          { error: "Payroll item not found" },
          { status: 404 },
        );
      }

      const newAllowances =
        allowances !== undefined ? allowances : currentItem[0].allowances;
      const newDeductions =
        deductions !== undefined ? deductions : currentItem[0].deductions;
      const grossSalary = currentItem[0].gross_salary;
      const netSalary =
        parseFloat(grossSalary) +
        parseFloat(newAllowances) -
        parseFloat(newDeductions);

      const result = await sql`
        UPDATE payroll_items
        SET 
          allowances = ${newAllowances},
          deductions = ${newDeductions},
          net_salary = ${netSalary},
          payment_status = ${payment_status || currentItem[0].payment_status},
          payment_date = ${payment_date !== undefined ? payment_date : currentItem[0].payment_date},
          notes = ${notes !== undefined ? notes : currentItem[0].notes},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${item_id}
        RETURNING *
      `;

      return Response.json({ payrollItem: result[0] });
    }

    return Response.json(
      { error: "No valid update operation specified" },
      { status: 400 },
    );
  } catch (err) {
    console.error("PUT /api/payroll/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
