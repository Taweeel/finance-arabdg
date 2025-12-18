// apps/web/src/app/api/auth/session/route.js
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth?.();
    if (!session) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ ok: true, user: session?.user ?? null });
  } catch (err) {
    console.error('Auth session error', err);
    // Include details in dev
    const errorResponse = { 
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    };
    return Response.json(errorResponse, { status: 500 });
  }
}

// End
