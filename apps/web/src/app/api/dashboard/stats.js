import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function loader() {
  try {
    // Get summary stats
    const summaryResult = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as total_income,
        COALESCE((
          SELECT COALESCE(SUM(base_salary + bonuses - deductions), 0) 
          FROM payroll_items WHERE payment_status = 'paid'
        ), 0) + COALESCE((
          SELECT COALESCE(SUM(amount), 0) 
          FROM subscription_expenses WHERE status = 'active'
        ), 0) + COALESCE((
          SELECT COALESCE(SUM(amount), 0) 
          FROM petty_cash WHERE type = 'withdrawal'
        ), 0) as total_expenses,
        COALESCE(COUNT(DISTINCT cc.id), 0) as active_clients,
        COALESCE(COUNT(CASE WHEN i.status != 'paid' THEN 1 END), 0) as outstanding_invoices,
        COALESCE(COUNT(CASE WHEN i.status != 'paid' AND i.due_date < CURRENT_DATE THEN 1 END), 0) as overdue_invoices,
        COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.amount ELSE 0 END), 0) as total_outstanding
      FROM invoices i
      LEFT JOIN company_clients cc ON i.company_client_id = cc.id
    `;

    const summary = summaryResult[0];

    // Calculate net profit
    const netProfit = Number(summary.total_income) - Number(summary.total_expenses);

    // Get expense breakdown
    const payrollExpenses = await sql`
      SELECT COALESCE(SUM(base_salary + bonuses - deductions), 0) as total
      FROM payroll_items WHERE payment_status = 'paid'
    `;

    const subscriptionExpenses = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM subscription_expenses WHERE status = 'active'
    `;

    const pettyCashExpenses = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM petty_cash WHERE type = 'withdrawal'
    `;

    const expenses = {
      payroll: Number(payrollExpenses[0]?.total || 0),
      subscriptions: Number(subscriptionExpenses[0]?.total || 0),
      pettyCash: Number(pettyCashExpenses[0]?.total || 0)
    };

    // Get monthly income for last 6 months
    const monthlyIncome = await sql`
      SELECT 
        TO_CHAR(payment_date, 'Mon') as month,
        EXTRACT(MONTH FROM payment_date) as month_num,
        COALESCE(SUM(amount), 0) as income
      FROM payments 
      WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(payment_date, 'Mon'), EXTRACT(MONTH FROM payment_date)
      ORDER BY month_num
      LIMIT 6
    `;

    // Get top clients by income
    const incomeByClient = await sql`
      SELECT 
        cc.name as client_name,
        COALESCE(SUM(p.amount), 0) as total_income
      FROM company_clients cc
      LEFT JOIN invoices i ON cc.id = i.company_client_id
      LEFT JOIN payments p ON i.id = p.invoice_id
      GROUP BY cc.id, cc.name
      HAVING COALESCE(SUM(p.amount), 0) > 0
      ORDER BY total_income DESC
      LIMIT 5
    `;

    return Response.json({
      summary: {
        ...summary,
        netProfit,
        total_income: Number(summary.total_income),
        total_expenses: Number(summary.total_expenses),
        total_outstanding: Number(summary.total_outstanding)
      },
      expenses,
      monthlyIncome: monthlyIncome.map(row => ({
        month: row.month,
        income: Number(row.income)
      })),
      incomeByClient: incomeByClient.map(row => ({
        client_name: row.client_name,
        total_income: Number(row.total_income)
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 }
    );
  }
}