import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {DebtType} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', {month: 'long', year: 'numeric'});
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthsBetween(startMonth: string, endMonth: string): string[] {
  const [startYear, startM] = startMonth.split('-').map(Number);
  const [endYear, endM] = endMonth.split('-').map(Number);

  const months: string[] = [];
  let currentDate = new Date(startYear, startM - 1);
  const endDate = new Date(endYear, endM - 1);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

export const getDebtTypeLabel = (type: DebtType) => {
  const labels: Record<DebtType, string> = {
    [DebtType.CREDIT]: 'Credit',
    [DebtType.CREDIT_CARD]: 'Credit Card',
    [DebtType.ACCOUNT_LIMIT]: 'Account Limit',
    [DebtType.LEASING]: 'Leasing',
    [DebtType.OTHER]: 'Other'
  };
  return labels[type];
};

export const getDebtTypeColor = (type: DebtType) => {
  const colors: Record<DebtType, string> = {
    [DebtType.CREDIT]: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    [DebtType.CREDIT_CARD]: 'bg-primary/10 text-primary border-primary/20',
    [DebtType.ACCOUNT_LIMIT]: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    [DebtType.LEASING]: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    [DebtType.OTHER]: 'bg-muted text-muted-foreground border-border'
  };
  return colors[type];
};