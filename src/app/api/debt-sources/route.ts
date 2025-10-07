import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DebtSource from '@/models/DebtSource';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const debtSources = await DebtSource.find({
      userId,
      isActive: true
    }).sort({ createdAt: -1 });

    return NextResponse.json(debtSources);
  } catch (error) {
    console.error('GET /api/debt-sources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const debtSource = await DebtSource.create({
      ...body,
      userId,
      isActive: true
    });

    return NextResponse.json(debtSource, { status: 201 });
  } catch (error) {
    console.error('POST /api/debt-sources error:', error);
    return NextResponse.json(
      { error: 'Failed to create debt source' },
      { status: 500 }
    );
  }
}