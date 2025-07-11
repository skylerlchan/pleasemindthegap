/*
  # Add next_step column to projects table

  1. Changes
    - Add `next_step` column to `projects` table to store the next action item for each project
    - Column is nullable text field to allow projects without defined next steps

  2. Notes
    - This enables project management with clear next action tracking
    - Helps identify projects that need attention (no next step defined)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'next_step'
  ) THEN
    ALTER TABLE projects ADD COLUMN next_step text;
  END IF;
END $$;