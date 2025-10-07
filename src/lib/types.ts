export enum DebtType {
  CREDIT = 'CREDIT',
  CREDIT_CARD = 'CREDIT_CARD',
  ACCOUNT_LIMIT = 'ACCOUNT_LIMIT',
  LEASING = 'LEASING',
  OTHER = 'OTHER'
}

export interface IDebtSource {
  _id?: string;
  userId: string;
  name: string;                    // e.g., "mBank Credit Card", "Car Loan"
  type: DebtType;
  initialAmount: number;           // Original debt amount
  interestRate?: number;           // Annual % (optional if unknown)
  minMonthlyPayment: number;       // Minimum required payment
  canOverpay: boolean;             // Can pay more than minimum?

  // Only for ACCOUNT_LIMIT type
  accountLimit?: number;           // e.g., 14600 for company account

  isActive: boolean;               // For soft delete / archiving
  color?: string;                  // For charts (chart-1, chart-2, etc.)
  notes?: string;                  // Optional user notes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISettings {
  _id?: string;
  userId: string;
  flatPricePerM2: number;          // For net worth → m² calculation
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecord {
  _id?: string;
  userId: string;
  month: string;                   // "2025-10"

  // Snapshot of all debts this month
  debts: {
    debtSourceId: string;          // Reference to DebtSource._id
    amount: number;                // Current balance/debt amount
    payment?: number;              // Optional: payment made this month
  }[];

  assets: number;                  // Total assets

  createdAt?: Date;
  updatedAt?: Date;
}