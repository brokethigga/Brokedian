-- ═══ BROKEDIAN SUPABASE SCHEMA ═══
-- Run this in Supabase SQL Editor

-- 1. PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  biz_name TEXT,
  address TEXT,
  tax_id TEXT,
  phone TEXT,
  bank_details TEXT,
  promptpay_id TEXT,
  signature TEXT,
  payment_terms TEXT,
  brand_color TEXT DEFAULT '#7C6EF5',
  logo_url TEXT,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS / INVOICES
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT,
  name TEXT NOT NULL,
  project TEXT,
  amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date DATE,
  notes TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUOTES
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  client_email TEXT,
  status TEXT DEFAULT 'draft',
  expiry_date DATE,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FORECAST DEALS
CREATE TABLE forecast_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 50,
  client_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATION PREFERENCES
CREATE TABLE notification_prefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_invoice_created BOOLEAN DEFAULT true,
  email_payment_received BOOLEAN DEFAULT true,
  email_overdue_reminder BOOLEAN DEFAULT true,
  push_invoice_created BOOLEAN DEFAULT true,
  push_payment_received BOOLEAN DEFAULT true,
  push_overdue_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATION LOG
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ PUSH SUBSCRIPTIONS ═══
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS local_id TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS local_id TEXT;
ALTER TABLE forecast_deals ADD COLUMN IF NOT EXISTS local_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS clients_user_local_id_idx ON clients(user_id, local_id);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_user_local_id_idx ON quotes(user_id, local_id);
CREATE UNIQUE INDEX IF NOT EXISTS forecast_deals_user_local_id_idx ON forecast_deals(user_id, local_id);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Client policies
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- Quote policies
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quotes"
  ON quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quotes"
  ON quotes FOR DELETE USING (auth.uid() = user_id);

-- Forecast policies
CREATE POLICY "Users can view own deals"
  ON forecast_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals"
  ON forecast_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals"
  ON forecast_deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals"
  ON forecast_deals FOR DELETE USING (auth.uid() = user_id);

-- Notification prefs policies
CREATE POLICY "Users can view own notification prefs"
  ON notification_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification prefs"
  ON notification_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification prefs"
  ON notification_prefs FOR UPDATE USING (auth.uid() = user_id);

-- Notification log policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Push subscription policies
CREATE POLICY "Users can manage own push sub"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ═══ AUTO-CREATE PROFILE ON SIGNUP ═══
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO profiles (id, email, tier)
  VALUES (NEW.id, NEW.email, 'free');
  INSERT INTO notification_prefs (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══ UPDATED AT TRIGGER ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER forecast_updated_at BEFORE UPDATE ON forecast_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER notif_prefs_updated_at BEFORE UPDATE ON notification_prefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER push_sub_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
