import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * IMPORTANT: This endpoint is for creating the FIRST admin user only.
 * After creating your first admin user in both development and production,
 * you should DELETE this file for security.
 *
 * To use: After signing up, visit /setup-admin to make yourself an admin.
 */

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;

    // Check if user already has a profile
    const existingProfile = await sql`
      SELECT id, role FROM users_extended WHERE auth_user_id = ${authUserId} LIMIT 1
    `;

    if (existingProfile && existingProfile.length > 0) {
      // Update existing profile to admin
      const result = await sql`
        UPDATE users_extended 
        SET role = 'admin', updated_at = CURRENT_TIMESTAMP
        WHERE auth_user_id = ${authUserId}
        RETURNING id, auth_user_id, full_name, role, active
      `;

      return Response.json({
        profile: result?.[0],
        message:
          "Admin role assigned successfully. Please delete this endpoint now.",
      });
    } else {
      // Create new profile with admin role
      const result = await sql`
        INSERT INTO users_extended (auth_user_id, full_name, role, active)
        VALUES (${authUserId}, ${session.user.name || "Admin"}, 'admin', true)
        RETURNING id, auth_user_id, full_name, role, active
      `;

      return Response.json({
        profile: result?.[0],
        message:
          "Admin profile created successfully. Please delete this endpoint now.",
      });
    }
  } catch (err) {
    console.error("POST /api/user/make-admin error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
