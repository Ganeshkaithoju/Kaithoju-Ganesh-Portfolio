/**
 * Moderation columns are now provisioned via Supabase migrations.
 * This module is kept as a no-op for backwards compatibility with any
 * remaining callers.
 */

export async function initializeMessageModeration(): Promise<void> {
  // No-op: schema is managed by supabase/migrations.
}
