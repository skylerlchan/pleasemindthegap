/*
  # Add status column to projects table

  1. Schema Changes
    - Add `status` column to `projects` table
    - Allows manual marking of projects as finished
    - Nullable field for backward compatibility

  2. Security
    - Maintains existing RLS policies
    - No additional security changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text;
  END IF;
END $$;