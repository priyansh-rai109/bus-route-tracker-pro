-- =========================================================================
-- JIET SMART BUS SYSTEM - SUPABASE SQL SCHEMA
-- Paste this entire file into the Supabase SQL Editor and click "Run"
-- =========================================================================

-- 1. Create the Routes Table
CREATE TABLE public.routes (
    id TEXT PRIMARY KEY, -- e.g., 'JT-01 ALPHA'
    start_point TEXT NOT NULL,
    end_point TEXT NOT NULL,
    distance TEXT NOT NULL,
    est_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Optimal', 'Heavy Traffic', 'Standby', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create the Drivers Table
CREATE TABLE public.drivers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    license TEXT UNIQUE NOT NULL,
    route TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Standby', 'Off Duty')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create the Students Table
CREATE TABLE public.students (
    id TEXT PRIMARY KEY, -- e.g., 'STU1001'
    name TEXT NOT NULL,
    route TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    stop TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('On Board', 'Dropped', 'Missed', 'Pending')),
    board_time TEXT,
    parent TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create the Alerts/Incident Logs Table
CREATE TABLE public.alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('warn', 'info', 'ok', 'sos')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) SETTINGS
-- Allow anonymous read access for the dashboard (Since this is a frontend prototype)
-- =========================================================================

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public read access on alerts" ON public.alerts FOR SELECT USING (true);

-- Allow public inserts for testing "Add Route" logic
CREATE POLICY "Allow public insert on routes" ON public.routes FOR INSERT WITH CHECK (true);

-- =========================================================================
-- SEED MOCK DATA
-- Run this to populate the tables with initial data
-- =========================================================================

-- Seed Routes
INSERT INTO public.routes (id, start_point, end_point, distance, est_time, status) VALUES
('JT-01 ALPHA', 'Sector A-10', 'JIET Campus', '14.5 km', '45 mins', 'Optimal'),
('JT-02 BETA', 'Sector B-22', 'JIET Campus', '18.2 km', '55 mins', 'Heavy Traffic'),
('JT-03 GAMMA', 'Sector C-05', 'JIET Campus', '12.0 km', '35 mins', 'Optimal'),
('JT-04 DELTA', 'City Station', 'JIET Campus', '22.4 km', '1h 10m', 'Standby');

-- Seed Drivers
INSERT INTO public.drivers (name, license, route, rating, status) VALUES
('Ramesh Kumar', 'DL-14-2015-894', 'JT-01 ALPHA', 4.8, 'Active'),
('Suresh Singh', 'DL-14-2018-112', 'JT-02 BETA', 4.9, 'Active'),
('Mohammad Ali', 'DL-14-2012-445', 'JT-03 GAMMA', 4.7, 'Active'),
('Vikram Das', 'DL-14-2020-999', 'JT-04 DELTA', 4.5, 'Standby'),
('Prakash Rao', 'DL-14-2016-333', NULL, 4.2, 'Off Duty');

-- Seed Alerts
INSERT INTO public.alerts (type, message) VALUES
('warn', 'JT-02 Beta experiencing 5-minute delay due to traffic at Residency Rd.'),
('info', 'Student STU1024 manually flagged as On Board by Driver Suresh.'),
('ok', 'Morning fleet initialization complete. All diagnostics green.'),
('warn', 'Low fuel warning on JT-04 Delta. Scheduled for refuel.');

-- Seed Students
INSERT INTO public.students (id, name, route, stop, status, board_time, parent, contact) VALUES
('STU1000', 'Aarav Sharma', 'JT-01 ALPHA', 'Sector A-10', 'On Board', '07:15 AM', 'Guardian 0', '+91 9876543210'),
('STU1001', 'Vivaan Gupta', 'JT-02 BETA', 'Sector B-22', 'Dropped', '07:22 AM', 'Guardian 1', '+91 9123456789'),
('STU1002', 'Aditya Singh', 'JT-03 GAMMA', 'Sector C-05', 'On Board', '07:45 AM', 'Guardian 2', '+91 9988776655'),
('STU1003', 'Vihaan Patel', 'JT-01 ALPHA', 'Main Gate', 'Missed', '07:50 AM', 'Guardian 3', '+91 9444455555'),
('STU1004', 'Arjun Kumar', 'JT-02 BETA', 'Sector B-22', 'On Board', '07:30 AM', 'Guardian 4', '+91 9111122222');
