/**
 * Admin Users Configuration
 *
 * Only users defined here can access the moderation dashboard.
 *
 * ============================================================================
 * SETUP INSTRUCTIONS
 * ============================================================================
 *
 * Step 1: Generate a bcrypt hash for your password
 *
 *   Terminal: npx bcryptjs "your_password_here"
 *   Output:   $2b$10/... (copy this entire string)
 *
 * Step 2: Replace the passwordHash below with your bcrypt hash
 *
 * Step 3: Keep this file secure - never commit real passwords to git
 *
 * ============================================================================
 * TO ADD MORE ADMINS
 * ============================================================================
 *
 * Just add another object to the array:
 *
 * {
 *   email: "another@example.com",
 *   passwordHash: "$2b$10/...",
 *   name: "Another Admin"
 * }
 *
 * No database changes needed. Deploy and new admin account is active.
 *
 * ============================================================================
 * SECURITY NOTES
 * ============================================================================
 *
 * ✅ DO:
 *   - Use strong passwords (min 12 characters)
 *   - Generate bcrypt hashes locally
 *   - Use different passwords for each admin
 *   - Store this in .env.production for deployed sites
 *
 * ❌ DON'T:
 *   - Commit plain text passwords
 *   - Share bcrypt hashes publicly
 *   - Use weak passwords
 *   - Reuse passwords across accounts
 *
 * ============================================================================
 */

export default [
  {
    email: "ganeshkaithoju4685@gmail.com",
    // ⚠️ IMPORTANT: Replace this with your actual bcrypt hash
    // Generate with: npx bcryptjs "your_password_here"
    passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDedu4JkaLCJL.6",
    name: "Ganesh Kaithoju"
  },

  // Add more admin accounts here as needed:
  // {
  //   email: "second@example.com",
  //   passwordHash: "$2b$10/bcrypt_hash_here",
  //   name: "Second Admin"
  // }
];
