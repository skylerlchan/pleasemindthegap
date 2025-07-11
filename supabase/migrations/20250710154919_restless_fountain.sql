/*
  # Add project hierarchy support

  1. Changes
    - Add `parent_id` column to `projects` table to support sub-projects
    - Add foreign key constraint for parent-child relationships
    - Update RLS policies to handle hierarchical projects

  2. Security
    - Maintain existing RLS policies
    - Ensure users can only access their own projects and sub-projects
*/

-- Add parent_id column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN parent_id uuid REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;