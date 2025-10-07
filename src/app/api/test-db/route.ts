import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: 'MongoDB connected successfully',
      database: mongoose.connection.db?.databaseName,
      readyState: mongoose.connection.readyState // 1 = connected
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}