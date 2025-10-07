import {auth} from '@clerk/nextjs/server';
import {NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import DebtSource from '@/models/DebtSource';

export async function GET(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {id} = await params; // Await params here

    await connectDB();
    const debtSource = await DebtSource.findOne({
      _id: id,
      userId
    });

    if (!debtSource) {
      return NextResponse.json(
        {error: 'Debt source not found'},
        {status: 404}
      );
    }

    return NextResponse.json(debtSource);
  } catch (error) {
    console.error('GET /api/debt-sources/[id] error:', error);
    return NextResponse.json(
      {error: 'Failed to fetch debt source'},
      {status: 500}
    );
  }
}

export async function PUT(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {id} = await params; // Await params here
    const body = await request.json();
    await connectDB();

    const debtSource = await DebtSource.findOneAndUpdate(
      {_id: id, userId},
      {$set: body},
      {new: true}
    );

    if (!debtSource) {
      return NextResponse.json(
        {error: 'Debt source not found'},
        {status: 404}
      );
    }

    return NextResponse.json(debtSource);
  } catch (error) {
    console.error('PUT /api/debt-sources/[id] error:', error);
    return NextResponse.json(
      {error: 'Failed to update debt source'},
      {status: 500}
    );
  }
}

export async function DELETE(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const {userId} = await auth();
    if (!userId) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {id} = await params; // Await params here
    await connectDB();

    // Soft delete by setting isActive to false
    const debtSource = await DebtSource.findOneAndUpdate(
      {_id: id, userId},
      {$set: {isActive: false}},
      {new: true}
    );

    if (!debtSource) {
      return NextResponse.json(
        {error: 'Debt source not found'},
        {status: 404}
      );
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('DELETE /api/debt-sources/[id] error:', error);
    return NextResponse.json(
      {error: 'Failed to delete debt source'},
      {status: 500}
    );
  }
}