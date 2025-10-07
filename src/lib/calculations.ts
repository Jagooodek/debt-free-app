// lib/calculations.ts

import {IRecord, IDebtSource, ISettings, CalculatedRecord, CalculatedDebtSource} from './types';

export function calculateRecordsAndDebtSources(
  records: IRecord[],
  debtSources: IDebtSource[],
  settings: ISettings
): [CalculatedRecord[], CalculatedDebtSource[]] {
  const calculatedRecords: CalculatedRecord[] = [];
  const calculatedDebtSources: CalculatedDebtSource[] = debtSources.map(debtSource => {
    return {...debtSource, currentAmount: debtSource.initialAmount, historyOfPayments: []}
  })

  records.toReversed().forEach(record => calculatedRecords.push(calculateRecord(record, calculatedDebtSources, settings)));
  return [calculatedRecords.toReversed(), calculatedDebtSources];
}


function calculateRecord(
  record: IRecord,
  debtSources: CalculatedDebtSource[],
  settings: ISettings,
): CalculatedRecord {
  const debtSourceMap = new Map(
    debtSources.map(ds => [ds._id!.toString(), ds])
  );

  let totalDebt = debtSources.reduce((sum, ds) => sum + ds.currentAmount, 0);
  const calculatedRecordDebts: {
    debtSourceId: string;
    payment: number;
    amount: number;
  }[] = [];

  record.debts.forEach(debt => {
    const source = debtSourceMap.get(debt.debtSourceId);
    if (!source) return;

    const previousAmount = source.currentAmount;
    totalDebt -= debt.payment;
    calculatedRecordDebts.push({...debt, amount: previousAmount - debt.payment});
  });

  const netWorth = record.assets - totalDebt;
  const flatM2 = netWorth / settings.flatPricePerM2;

  const totalPayment = record.debts.reduce(
    (sum, debt) => sum + (debt.payment || 0),
    0
  );

  const calculatedRecord = {
    ...record,
    debts: calculatedRecordDebts,
    totalDebt,
    netWorth,
    flatM2,
    totalPayment,
  }

  record.debts.forEach(debt => {
    const source = debtSourceMap.get(debt.debtSourceId);
    if (!source) return;

    source.historyOfPayments.push({
      record: calculatedRecord,
      payment: debt.payment,
      amount: source.currentAmount - debt.payment,
    })

    source.currentAmount -= debt.payment;
  })

  return {
    ...record,
    debts: calculatedRecordDebts,
    totalDebt,
    netWorth,
    flatM2,
    totalPayment,

  };
}

// Helper to get minimum total payment based on debt sources
export function calculateMinimumPayment(debtSources: IDebtSource[]): number {
  return debtSources
    .filter(ds => ds.isActive)
    .reduce((sum, ds) => sum + ds.minMonthlyPayment, 0);
}
