import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/ellevate_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
