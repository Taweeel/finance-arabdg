import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get dashboard statistics
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Total income (from payments)
    let incomeQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_income
      FROM payments
      WHERE 1=1
    `;
    const incomeValues = [];
    let incomeParamCount = 1;

    if (startDate) {
      incomeQuery += ` AND payment_date >= $${incomeParamCount}`;
      incomeValues.push(startDate);
      incomeParamCount++;
    }

    if (endDate) {
      incomeQuery += ` AND payment_date <= $${incomeParamCount}`;
      incomeValues.push(endDate);
      incomeParamCount++;
    }

    const incomeResult = await sql(incomeQuery, incomeValues);
    const totalIncome = parseFloat(incomeResult[0]?.total_income || 0);

    // Total expenses (payroll + subscriptions + petty cash)
    let expenseQuery = `
      SELECT 
        (
          SELECT COALESCE(SUM(net_salary), 0)
          FROM payroll_items pi
          JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
          WHERE pi.payment_status = 'paid'
        ) as payroll_expenses,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM subscription_expenses
          WHERE status = 'active'
        ) as subscription_expenses,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM daily_expense_transactions
          WHERE 1=1
        ) as petty_cash_expenses
    `;

    const expenseResult = await sql(expenseQuery);
    const payrollExpenses = parseFloat(expenseResult[0]?.payroll_expenses || 0);
    const subscriptionExpenses = parseFloat(
      expenseResult[0]?.subscription_expenses || 0,
    );
    const pettyCashExpenses = parseFloat(
      expenseResult[0]?.petty_cash_expenses || 0,
    );
    const totalExpenses =
      payrollExpenses + subscriptionExpenses + pettyCashExpenses;

    // Outstanding invoices
    const outstandingResult = await sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(i.total_amount - COALESCE(
          (SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id), 0
        )), 0) as total_outstanding
      FROM invoices i
      WHERE i.status IN ('issued', 'partially_paid', 'overdue')
    `;

    const outstandingInvoices = parseInt(outstandingResult[0]?.count || 0);
    const totalOutstanding = parseFloat(
      outstandingResult[0]?.total_outstanding || 0,
    );

    // Overdue invoices
    const overdueResult = await sql`
      SELECT COUNT(*) as count
      FROM invoices
      WHERE status = 'overdue'
    `;

    const overdueInvoices = parseInt(overdueResult[0]?.count || 0);

    // Active clients
    const clientsResult = await sql`
      SELECT COUNT(*) as count
      FROM company_clients
      WHERE active = true
    `;

    const activeClients = parseInt(clientsResult[0]?.count || 0);

    // Monthly income trend (last 6 months)
    const monthlyIncomeResult = await sql`
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0) as income
      FROM payments
      WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Income by client
    const incomeByClientResult = await sql`
      SELECT 
        cc.name as client_name,
        COALESCE(SUM(p.amount), 0) as total_income
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN company_clients cc ON i.company_client_id = cc.id
      GROUP BY cc.name
      ORDER BY total_income DESC
      LIMIT 10
    `;

    return Response.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        outstandingInvoices,
        totalOutstanding,
        overdueInvoices,
        activeClients,
      },
      expenses: {
        payroll: payrollExpenses,
        subscriptions: subscriptionExpenses,
        pettyCash: pettyCashExpenses,
        total: totalExpenses,
      },
      monthlyIncome: monthlyIncomeResult,
      incomeByClient: incomeByClientResult,
    });
  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
