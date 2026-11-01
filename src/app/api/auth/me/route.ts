import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, sessionCookieOptions, signToken, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

function clearSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', sessionCookieOptions(0));
  return response;
}

export async function GET() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const userId = Number(payload?.userId);
    if (!payload || !Number.isSafeInteger(userId)) {
      return clearSession(NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        membershipPaidOn: true,
      },
    });

    if (!user) {
      return clearSession(NextResponse.json({ success: false, error: 'User not found' }, { status: 401 }));
    }

    const response = NextResponse.json({ success: true, data: user });
    // Refresh a stale role so middleware and the client agree after a promotion or demotion.
    if (payload.role !== user.role) {
      response.cookies.set(COOKIE_NAME, await signToken(user.id, user.role), sessionCookieOptions());
    }
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
