import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [],
};

export default function middleware(req: NextRequest) {
    return NextResponse.next();
}
