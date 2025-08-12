-- Create the 'roles' table
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL UNIQUE,
    description text,
    status public.user_status DEFAULT 'Active'::public.user_status NOT NULL,
    permissions jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'users' table with a foreign key to 'roles'
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    email character varying NOT NULL UNIQUE,
    role character varying DEFAULT 'Staff'::character varying NOT NULL,
    status public.user_status DEFAULT 'Active'::public.user_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'employees' table
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    address text,
    contact_info character varying,
    role character varying,
    start_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'task_types' table
CREATE TABLE IF NOT EXISTS public.task_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    description text,
    unit_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'assigned_tasks' table
CREATE TABLE IF NOT EXISTS public.assigned_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    task_type_id uuid NOT NULL REFERENCES public.task_types(id) ON DELETE RESTRICT,
    quantity_completed integer NOT NULL,
    date_assigned date NOT NULL,
    total_payment numeric(10,2) NOT NULL,
    status character varying DEFAULT 'Completed'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'payments' table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    amount numeric(10,2) NOT NULL,
    payment_type character varying NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'sales' table
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    product_name character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    date date NOT NULL,
    receipt_number character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the 'expenses' table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date date NOT NULL,
    receipt_number character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- SEED initial data for Roles
INSERT INTO public.roles (name, description, status, permissions) VALUES
('Admin', 'Has all permissions.', 'Active', '["/"]'::jsonb),
('Manager', 'Can access most features including reports and management sections.', 'Active', '["/"]'::jsonb),
('Finance', 'Can access financial records, sales, and expenses.', 'Active', '["/finances"]'::jsonb),
('Coordinator', 'Can manage work logs and payments.', 'Active', '["/work-log"]'::jsonb),
('Staff', 'Can view their own dashboard and limited information.', 'Active', '["/"]'::jsonb)
ON CONFLICT (name) DO NOTHING;


-- RLS POLICIES
-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for 'users' table
DROP POLICY IF EXISTS "Allow authenticated users to read their own user data" ON public.users;
CREATE POLICY "Allow authenticated users to read their own user data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin/manager to read all user data" ON public.users;
CREATE POLICY "Allow admin/manager to read all user data" ON public.users FOR SELECT USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'Manager')
);
DROP POLICY IF EXISTS "Allow authenticated users to update their own user data" ON public.users;
CREATE POLICY "Allow authenticated users to update their own user data" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin/manager to update all user data" ON public.users;
CREATE POLICY "Allow admin/manager to update all user data" ON public.users FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'Manager')
);

-- Policies for 'roles' table
DROP POLICY IF EXISTS "Allow admin/manager to manage roles" ON public.roles;
CREATE POLICY "Allow admin/manager to manage roles" ON public.roles FOR ALL USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'Manager')
);

DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.roles;
CREATE POLICY "Allow authenticated users to read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');


-- Policies for other tables (General access for authenticated users with specific roles)
-- This allows any logged-in user to perform actions, middleware should handle authorization.
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.employees;
CREATE POLICY "Allow full access for authenticated users" ON public.employees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.task_types;
CREATE POLICY "Allow full access for authenticated users" ON public.task_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.assigned_tasks;
CREATE POLICY "Allow full access for authenticated users" ON public.assigned_tasks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.payments;
CREATE POLICY "Allow full access for authenticated users" ON public.payments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.sales;
CREATE POLICY "Allow full access for authenticated users" ON public.sales FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.expenses;
CREATE POLICY "Allow full access for authenticated users" ON public.expenses FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
