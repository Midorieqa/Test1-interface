/*
  # Create user settings table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `display_settings` (jsonb)
      - `news_columns` (jsonb)
      - `corp_columns` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  display_settings jsonb NOT NULL DEFAULT '{
    "searchResultsPageSize": 10,
    "newsTablePageSize": 10,
    "corpListPageSize": 10
  }',
  news_columns jsonb NOT NULL DEFAULT '[
    {"id": "risk_analysis", "label": "Risk Analysis", "enabled": true},
    {"id": "opportunity_analysis", "label": "Opportunity Analysis", "enabled": true},
    {"id": "sentiment_analysis", "label": "Sentiment Analysis", "enabled": true},
    {"id": "news_summary", "label": "News Summary", "enabled": true}
  ]',
  corp_columns jsonb NOT NULL DEFAULT '[
    {"id": "risk_analysis", "label": "Risk Analysis", "enabled": true},
    {"id": "opportunity_analysis", "label": "Opportunity Analysis", "enabled": true},
    {"id": "sentiment_analysis", "label": "Sentiment Analysis", "enabled": true},
    {"id": "company_summary", "label": "Company Summary", "enabled": true}
  ]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
