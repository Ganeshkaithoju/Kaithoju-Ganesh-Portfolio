/**
 * Database Schema Migration
 * 
 * Run this once to update the contact_messages table with moderation fields.
 * This adds status tracking for message approval workflow.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function initializeMessageModeration() {
  try {
    // Check if columns exist, if not add them
    const { error: checkError } = await supabaseAdmin
      .from("contact_messages")
      .select("is_approved, is_featured, is_pinned, status")
      .limit(1);

    if (checkError?.message.includes("column") || checkError?.message.includes("does not exist")) {
      console.log("Initializing moderation columns...");

      // Add is_approved column
      try {
        const { error } = await supabaseAdmin.rpc("add_column_if_not_exists", {
          table_name: "contact_messages",
          column_name: "is_approved",
          column_type: "boolean DEFAULT false",
        });
        if (error) console.warn("is_approved:", error.message);
      } catch (e) {
        console.warn("Could not add is_approved via RPC");
      }

      // Note: Supabase doesn't allow direct DDL via JavaScript SDK
      // You'll need to run these SQL commands in Supabase dashboard:
      /*
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted'));
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;
      
      CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
      CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON contact_messages(is_approved);
      CREATE INDEX IF NOT EXISTS idx_messages_is_featured ON contact_messages(is_featured);
      CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON contact_messages(is_pinned);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);
      */

      console.log(
        "Please run the SQL migration in Supabase dashboard (see comments in this file)"
      );
    } else {
      console.log("Moderation columns already exist");
    }
  } catch (error) {
    console.error("Migration check failed:", error);
  }
}

/**
 * SQL to run in Supabase SQL Editor:
 * 
 * BEGIN;
 * 
 * ALTER TABLE contact_messages 
 * ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
 * ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
 * ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
 * ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted')),
 * ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
 * 
 * CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
 * CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON contact_messages(is_approved);
 * CREATE INDEX IF NOT EXISTS idx_messages_is_featured ON contact_messages(is_featured);
 * CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON contact_messages(is_pinned);
 * CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);
 * 
 * COMMIT;
 */
