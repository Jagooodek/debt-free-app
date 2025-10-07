import mongoose, {Schema} from 'mongoose';
import {IDebtSource, DebtType} from '@/lib/types';

const DebtSourceSchema = new Schema<IDebtSource>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(DebtType),
      required: true
    },
    initialAmount: {
      type: Number,
      required: true
    },
    interestRate: {
      type: Number,
      required: false
    },
    minMonthlyPayment: {
      type: Number,
      required: true
    },
    canOverpay: {
      type: Boolean,
      default: true
    },
    accountLimit: {
      type: Number,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      required: false
    },
    notes: {
      type: String,
      required: false
    }
  },
  {timestamps: true}
);

DebtSourceSchema.index({userId: 1, isActive: 1});

export default mongoose.models.DebtSource ||
mongoose.model<IDebtSource>('DebtSource', DebtSourceSchema);