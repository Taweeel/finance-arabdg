// apps/web/src/app/api/auth/session/route.js
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ ok: true, user: session?.user ?? null });
  } catch (err) {
    console.error('Auth session error', err);
    return Response.json({ message: 'Internal Server Error', detail: String(err) }, { status: 500 });
  }
}

// End
