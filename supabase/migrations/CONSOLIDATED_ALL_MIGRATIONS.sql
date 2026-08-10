-- ==============================================================================
-- ALIEN OS — FINAL CONSOLIDATED ALL MIGRATIONS (1 to 20)
-- Executar este arquivo completo no SQL Editor do Supabase Dashboard
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Initial Core Schema & Extensions
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 2. Profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'MEMBER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 3. Financial Module
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'EXPENSE',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PAID',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 4. Document Center
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  folder VARCHAR(100) DEFAULT 'Geral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES public.profiles(id),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 5. Tasks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO',
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 6. Meetings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  link_url TEXT,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 7. Projects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'IN_PROGRESS',
  progress_percentage INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 8. Campaign Hubs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  budget NUMERIC(12, 2) DEFAULT 0.00,
  spent NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 9. Growth Experiments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.growth_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  hypothesis TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PLANNED',
  impact_score INT DEFAULT 5,
  confidence_score INT DEFAULT 5,
  ease_score INT DEFAULT 5,
  rice_score NUMERIC(5, 2) DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 10. Integrations & Logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'PAID_MEDIA',
  status VARCHAR(20) DEFAULT 'DISCONNECTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  message TEXT,
  status_code INT DEFAULT 200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. GA4 Integration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ga4_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  account_name VARCHAR(150),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.ga4_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR(50) REFERENCES public.ga4_properties(property_id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  active_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  sessions INT DEFAULT 0,
  screen_page_views INT DEFAULT 0,
  conversions INT DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_ga4_property_date UNIQUE(property_id, metric_date)
);

-- ------------------------------------------------------------------------------
-- 12. Google Ads Integration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.google_ads_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_provider_id VARCHAR(50) DEFAULT 'google-ads',
  integration_account_id UUID DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  descriptive_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  manager BOOLEAN DEFAULT false,
  status VARCHAR(30) DEFAULT 'ENABLED',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.google_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  integration_provider_id VARCHAR(50) DEFAULT 'google-ads',
  integration_account_id UUID,
  external_id VARCHAR(100),
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'ENABLED',
  campaign_type VARCHAR(100) DEFAULT 'SEARCH',
  advertising_channel_type VARCHAR(100) DEFAULT 'SEARCH',
  advertising_channel_sub_type VARCHAR(100),
  serving_status VARCHAR(50) DEFAULT 'SERVING',
  optimization_score NUMERIC(5, 2) DEFAULT 85.00,
  objective VARCHAR(100) DEFAULT 'SEARCH',
  bidding_strategy VARCHAR(100) DEFAULT 'MAXIMIZE_CONVERSIONS',
  budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.google_ads_ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id VARCHAR(50) NOT NULL REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  external_ad_group_id VARCHAR(100) NOT NULL UNIQUE,
  ad_group_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED',
  type VARCHAR(50) DEFAULT 'SEARCH_STANDARD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.google_ads_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID NOT NULL REFERENCES public.google_ads_ad_groups(id) ON DELETE CASCADE,
  external_ad_id VARCHAR(100) NOT NULL UNIQUE,
  headline TEXT,
  description TEXT,
  final_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.google_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  average_cpc NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  cost_micros BIGINT DEFAULT 0,
  conversions INT DEFAULT 0,
  all_conversions INT DEFAULT 0,
  conversion_value NUMERIC(12, 2) DEFAULT 0.00,
  cost_per_conversion NUMERIC(10, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  impression_share NUMERIC(5, 2) DEFAULT 0.00,
  search_impression_share NUMERIC(5, 2) DEFAULT 0.00,
  search_top_impression_share NUMERIC(5, 2) DEFAULT 0.00,
  video_views INT DEFAULT 0,
  view_through_conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gads_campaign_date UNIQUE(campaign_id, metric_date)
);

CREATE TABLE IF NOT EXISTS public.google_ads_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  finished_at TIMESTAMPTZ,
  duration_ms INT DEFAULT 0,
  records_processed INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 13. Marketing Core Universal Tables
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketing_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL,
  external_account_id VARCHAR(100) NOT NULL,
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) DEFAULT 'ENABLED',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_provider_account UNIQUE(provider_slug, external_account_id)
);

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL,
  external_campaign_id VARCHAR(100) NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED',
  objective VARCHAR(100) DEFAULT 'CONVERSIONS',
  daily_budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_provider_campaign UNIQUE(provider_slug, external_campaign_id)
);

CREATE TABLE IF NOT EXISTS public.marketing_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  cpa NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_marketing_campaign_date UNIQUE(campaign_id, metric_date)
);

-- ------------------------------------------------------------------------------
-- 14. Meta Ads Integration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meta_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'meta-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE,
  business_id VARCHAR(100),
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.meta_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  objective VARCHAR(100) DEFAULT 'OUTCOME_SALES',
  daily_budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.meta_ads_ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
  external_ad_set_id VARCHAR(100) NOT NULL UNIQUE,
  ad_set_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  billing_event VARCHAR(50) DEFAULT 'IMPRESSIONS',
  bid_strategy VARCHAR(50) DEFAULT 'LOWEST_COST_WITHOUT_CAP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.meta_ads_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
  ad_set_id UUID NOT NULL REFERENCES public.meta_ads_ad_sets(id) ON DELETE CASCADE,
  external_ad_id VARCHAR(100) NOT NULL UNIQUE,
  ad_name VARCHAR(255) NOT NULL,
  creative_id VARCHAR(100),
  thumbnail_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.meta_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  cpa NUMERIC(10, 2) DEFAULT 0.00,
  frequency NUMERIC(5, 2) DEFAULT 1.00,
  quality_ranking VARCHAR(50) DEFAULT 'AVERAGE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_meta_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

CREATE TABLE IF NOT EXISTS public.meta_ads_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  finished_at TIMESTAMPTZ,
  duration_ms INT DEFAULT 0,
  records_processed INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 15. TikTok Ads & LinkedIn Ads
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tiktok_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'tiktok-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE,
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.tiktok_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.tiktok_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  objective VARCHAR(100) DEFAULT 'CONVERSIONS',
  budget NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.tiktok_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.tiktok_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  cpa NUMERIC(10, 2) DEFAULT 0.00,
  video_views_p100 INT DEFAULT 0,
  profile_visits INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_tiktok_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

CREATE TABLE IF NOT EXISTS public.linkedin_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'linkedin-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE,
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.linkedin_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.linkedin_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  objective VARCHAR(100) DEFAULT 'LEAD_GENERATION',
  budget NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.linkedin_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.linkedin_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  leads INT DEFAULT 0,
  cpl NUMERIC(10, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_linkedin_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

-- ------------------------------------------------------------------------------
-- 16. Google Business Profile & Google Search Console
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gmb_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  location_id VARCHAR(100) NOT NULL UNIQUE,
  location_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(50),
  rating NUMERIC(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.gmb_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(100) NOT NULL REFERENCES public.gmb_locations(location_id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  queries_direct INT DEFAULT 0,
  queries_indirect INT DEFAULT 0,
  views_maps INT DEFAULT 0,
  views_search INT DEFAULT 0,
  actions_website INT DEFAULT 0,
  actions_phone INT DEFAULT 0,
  actions_driving_directions INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gmb_location_date UNIQUE(location_id, metric_date)
);

CREATE TABLE IF NOT EXISTS public.gmb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(100) NOT NULL REFERENCES public.gmb_locations(location_id) ON DELETE CASCADE,
  review_id VARCHAR(100) NOT NULL UNIQUE,
  reviewer_name VARCHAR(150) NOT NULL,
  star_rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  reply_text TEXT,
  review_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.gsc_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  site_url VARCHAR(255) NOT NULL UNIQUE,
  permission_level VARCHAR(50) DEFAULT 'siteOwner',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.gsc_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url VARCHAR(255) NOT NULL REFERENCES public.gsc_sites(site_url) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  position NUMERIC(5, 2) DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gsc_site_date UNIQUE(site_url, metric_date)
);

CREATE TABLE IF NOT EXISTS public.gsc_keyword_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url VARCHAR(255) NOT NULL REFERENCES public.gsc_sites(site_url) ON DELETE CASCADE,
  query_text VARCHAR(255) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  position NUMERIC(5, 2) DEFAULT 1.00,
  metric_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gsc_query_date UNIQUE(site_url, query_text, metric_date)
);

-- ------------------------------------------------------------------------------
-- 17. Alien Max AI Engine Core Tables
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alien_max_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Nova Análise Alien Max',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.alien_max_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.alien_max_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL DEFAULT 'USER',
  content TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.alien_max_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL DEFAULT 'PAID_MEDIA',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence_score INT DEFAULT 95,
  impact_mrr_estimate NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- RLS Enable & Policies (All Tables)
-- ------------------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_keyword_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_max_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_max_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_max_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Select Companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public Select Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Select Financial" ON public.financial_records FOR SELECT USING (true);
CREATE POLICY "Public Select Documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public Select Tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public Select Meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Public Select Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Select Campaign Hubs" ON public.campaign_hubs FOR SELECT USING (true);
CREATE POLICY "Public Select Growth Experiments" ON public.growth_experiments FOR SELECT USING (true);
CREATE POLICY "Public Select Integration Providers" ON public.integration_providers FOR SELECT USING (true);
CREATE POLICY "Public Select GA4 Properties" ON public.ga4_properties FOR SELECT USING (true);
CREATE POLICY "Public Select GA4 Metrics" ON public.ga4_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select Google Ads Customers" ON public.google_ads_customers FOR SELECT USING (true);
CREATE POLICY "Public Select Google Ads Campaigns" ON public.google_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Select Google Ads Ad Groups" ON public.google_ads_ad_groups FOR SELECT USING (true);
CREATE POLICY "Public Select Google Ads Ads" ON public.google_ads_ads FOR SELECT USING (true);
CREATE POLICY "Public Select Google Ads Metrics" ON public.google_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select Marketing Accounts" ON public.marketing_accounts FOR SELECT USING (true);
CREATE POLICY "Public Select Marketing Campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Select Marketing Metrics" ON public.marketing_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Accounts" ON public.meta_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Campaigns" ON public.meta_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Ad Sets" ON public.meta_ads_ad_sets FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Ads" ON public.meta_ads_ads FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Metrics" ON public.meta_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select Meta Ads Sync History" ON public.meta_ads_sync_history FOR SELECT USING (true);
CREATE POLICY "Public Select TikTok Accounts" ON public.tiktok_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public Select TikTok Campaigns" ON public.tiktok_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Select TikTok Metrics" ON public.tiktok_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select LinkedIn Accounts" ON public.linkedin_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public Select LinkedIn Campaigns" ON public.linkedin_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Select LinkedIn Metrics" ON public.linkedin_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select GMB Locations" ON public.gmb_locations FOR SELECT USING (true);
CREATE POLICY "Public Select GMB Metrics" ON public.gmb_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select GMB Reviews" ON public.gmb_reviews FOR SELECT USING (true);
CREATE POLICY "Public Select GSC Sites" ON public.gsc_sites FOR SELECT USING (true);
CREATE POLICY "Public Select GSC Metrics" ON public.gsc_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Select GSC Keywords" ON public.gsc_keyword_queries FOR SELECT USING (true);
CREATE POLICY "Public Select Alien Max Conversations" ON public.alien_max_conversations FOR SELECT USING (true);
CREATE POLICY "Public Select Alien Max Messages" ON public.alien_max_messages FOR SELECT USING (true);
CREATE POLICY "Public Select Alien Max Insights" ON public.alien_max_insights FOR SELECT USING (true);
