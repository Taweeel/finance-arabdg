-- Enable UUID extension if needed (though we might use serial/identity for IDs based on usage, let's assume serial for now as per common sql usage in the code)

-- Users Extended (Application specific user data)
CREATE TABLE IF NOT EXISTS users_extended (
  id SERIAL PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE, -- Links to the auth provider's user ID
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- admin, finance_manager, user
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Clients
CREATE TABLE IF NOT EXISTS company_clients (
  id SERIAL PRIMARY KEY,
  active BOOLEAN DEFAULT true,
  name TEXT NOT NULL,
  legal_name TEXT,
  contact_person_email TEXT,
  address TEXT,
  tax_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users_extended(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT,
  department TEXT,
  base_salary NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  hire_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  deal_name TEXT NOT NULL,
  company_client_id INTEGER REFERENCES company_clients(id),
  responsible_user_id INTEGER REFERENCES users_extended(id),
  status TEXT DEFAULT 'pending', -- pending, won, lost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  company_client_id INTEGER REFERENCES company_clients(id),
  deal_id INTEGER REFERENCES deals(id),
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Installments (for split payments)
CREATE TABLE IF NOT EXISTS invoice_installments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  recorded_by_user_id INTEGER REFERENCES users_extended(id),
  installment_id INTEGER REFERENCES invoice_installments(id),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, approved, paid
  created_by_user_id INTEGER REFERENCES users_extended(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, month)
);

-- Payroll Items (Individual employee payment in a run)
CREATE TABLE IF NOT EXISTS payroll_items (
  id SERIAL PRIMARY KEY,
  payroll_run_id INTEGER REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES employees(id),
  base_salary NUMERIC(10, 2),
  bonuses NUMERIC(10, 2) DEFAULT 0,
  deductions NUMERIC(10, 2) DEFAULT 0,
  net_salary NUMERIC(10, 2),
  payment_status TEXT DEFAULT 'pending', -- pending, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Expenses
CREATE TABLE IF NOT EXISTS subscription_expenses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT, -- monthly, yearly
  next_billing_date DATE,
  status TEXT DEFAULT 'active', -- active, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Petty Cash
CREATE TABLE IF NOT EXISTS petty_cash (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL, -- deposit, withdrawal
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  recorded_by_user_id INTEGER REFERENCES users_extended(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
