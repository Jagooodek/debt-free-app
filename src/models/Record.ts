import mongoose, {Schema} from 'mongoose';
import {IRecord} from '@/lib/types';

const RecordSchema = new Schema<IRecord>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    month: {
      type: String,
      required: true
    },
    debts: [{
      debtSourceId: {
        type: String,
        required: true
      },
      payment: {
        type: Number,
        required: true
      }
    }],
    assets: {
      type: Number,
      required: true
    }
  },
  {timestamps: true}
);

// Unique compound index: one record per user per month
RecordSchema.index({userId: 1, month: 1}, {unique: true});

// Index for sorted queries (newest first)
RecordSchema.index({userId: 1, month: -1});

export default mongoose.models.Record ||
mongoose.model<IRecord>('Record', RecordSchema);