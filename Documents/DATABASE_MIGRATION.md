# Database Migration - Comments Moderation System

## Instructions

To add the moderation functionality to your portfolio, you need to run the following SQL migration in your Supabase database.

### Steps:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL below
4. Click **Run**

## SQL Migration

```sql
BEGIN;

-- Add moderation columns to contact_messages table
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted')),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON contact_messages(is_approved);
CREATE INDEX IF NOT EXISTS idx_messages_is_featured ON contact_messages(is_featured);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON contact_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);

-- Update any existing messages to have a status value
UPDATE contact_messages SET status = 'approved' WHERE status IS NULL;

COMMIT;
```

## What This Does

- **is_approved** (BOOLEAN): Whether the message is approved to display publicly
- **is_featured** (BOOLEAN): Whether the message is featured on the portfolio
- **is_pinned** (BOOLEAN): Whether the message is pinned at the top
- **status** (TEXT): One of `pending`, `approved`, `hidden`, `deleted`
- **moderated_at** (TIMESTAMP): When the message was moderated
- **Indexes**: Created for faster querying by status, approval, featured, pinned, and created date

## Testing the Migration

After running the migration, test it by:

1. Going to **Data Editor** in Supabase
2. Click on `contact_messages` table
3. Verify the new columns exist and have default values

## Rolling Back (if needed)

If you need to rollback this migration:

```sql
ALTER TABLE contact_messages 
DROP COLUMN IF EXISTS is_approved,
DROP COLUMN IF EXISTS is_featured,
DROP COLUMN IF EXISTS is_pinned,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS moderated_at;

DROP INDEX IF EXISTS idx_messages_status;
DROP INDEX IF EXISTS idx_messages_is_approved;
DROP INDEX IF EXISTS idx_messages_is_featured;
DROP INDEX IF EXISTS idx_messages_is_pinned;
DROP INDEX IF EXISTS idx_messages_created_at;
```

## Notes

- Existing messages in your database will default to `status = 'pending'` and `is_approved = false`
- The update statement in the migration sets all existing messages to `status = 'approved'` so they appear on the portfolio immediately
- These changes are backward compatible with your existing contact form
