import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user profile with role information
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;

    // Get extended user profile
    const profiles = await sql`
      SELECT ue.id, ue.auth_user_id, ue.full_name, ue.role, ue.active, ue.created_at
      FROM users_extended ue
      WHERE ue.auth_user_id = ${authUserId}
      LIMIT 1
    `;

    const profile = profiles?.[0] || null;

    return Response.json({
      profile,
      authUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create user profile (during onboarding)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ["employee", "finance_manager", "client_contact"];
    if (!role || !validRoles.includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if profile already exists
    const existing = await sql`
      SELECT id FROM users_extended WHERE auth_user_id = ${authUserId} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return Response.json(
        { error: "Profile already exists" },
        { status: 400 },
      );
    }

    // Create new profile
    const result = await sql`
      INSERT INTO users_extended (auth_user_id, full_name, role, active)
      VALUES (${authUserId}, ${session.user.name || "User"}, ${role}, true)
      RETURNING id, auth_user_id, full_name, role, active, created_at
    `;

    const newProfile = result?.[0];

    return Response.json({ profile: newProfile });
  } catch (err) {
    console.error("POST /api/user/profile error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;
    const body = await request.json();
    const { role, active } = body;

    // Get current profile
    const currentProfile = await sql`
      SELECT id, role FROM users_extended WHERE auth_user_id = ${authUserId} LIMIT 1
    `;

    if (!currentProfile || currentProfile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileId = currentProfile[0].id;
    const currentRole = currentProfile[0].role;

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role && role !== currentRole) {
      // Only allow certain role changes (admin can only be set by existing admin)
      const validRoles = ["employee", "finance_manager", "client_contact"];
      if (!validRoles.includes(role)) {
        return Response.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (typeof active === "boolean") {
      updates.push(`active = $${paramCount}`);
      values.push(active);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE users_extended 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, auth_user_id, full_name, role, active, created_at, updated_at
    `;

    values.push(profileId);
    const result = await sql(query, values);

    return Response.json({ profile: result?.[0] });
  } catch (err) {
    console.error("PUT /api/user/profile error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
