import { NextResponse } from 'next/server';
import { getCategoryStats } from '@/lib/stats';

export async function GET() {
  try {
    return NextResponse.json(getCategoryStats());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category stats', detail: String(error) }, { status: 500 });
  }
}
