import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Record from '@/models/Record';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const records = await Record.find({ userId }).sort({ month: -1 });

    return NextResponse.json(records);
  } catch (error) {
    console.error('GET /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
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

    // Check if record for this month already exists
    const existingRecord = await Record.findOne({
      userId,
      month: body.month
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Record for this month already exists' },
        { status: 409 }
      );
    }

    const record = await Record.create({
      ...body,
      userId
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('POST /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}