// components/AddSnapshotDialog.tsx

'use client';

import {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useCalculatedRecordsAndDebts} from '@/hooks/useDebtTracker';
import {DebtType, IDebtSource} from '@/lib/types';
import {formatCurrency, getCurrentMonth, getDebtTypeColor, getDebtTypeLabel} from '@/lib/utils';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

interface AddSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
}

export function AddSnapshotDialog({
                                    open,
                                    onOpenChange,
                                    editingId
                                  }: AddSnapshotDialogProps) {
  const {calculatedRecords, calculatedDebts, createRecord, updateRecord} = useCalculatedRecordsAndDebts();
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());
  const [assets, setAssets] = useState('');
  const [debts, setDebts] = useState<Record<string, { payment: string }>>({});
  const [editingRecord, setEditingRecord] = useState<typeof calculatedRecords[0] | null>(null);

  // Initialize debts state
  useEffect(() => {
    if (editingId && open) {
      const record = calculatedRecords.find(r => r._id === editingId);
      if (record) {
        setEditingRecord(record);
        setMonth(record.month);
        setAssets(record.assets.toString());

        const debtsMap: Record<string, { payment: string }> = {};
        record.debts.forEach(debt => {
          const debtSource = calculatedDebts.find(ds => ds._id === debt.debtSourceId);

          if (debtSource?.type === DebtType.ACCOUNT_LIMIT) {
            // For account limits, show the balance that resulted in this debt amount
            // debt.amount is the debt after payment, so balance = limit - debt.amount
            const balance = (debtSource.accountLimit as number) - debt.amount;
            debtsMap[debt.debtSourceId] = {
              payment: balance.toString()
            };
          } else {
            debtsMap[debt.debtSourceId] = {
              payment: debt.payment?.toString() || ''
            };
          }
        });
        setDebts(debtsMap);
      }
    } else if (!editingId && open) {
      setEditingRecord(null);
      const debtsMap: Record<string, { payment: string }> = {};
      calculatedDebts.forEach(source => {
        if (source.type === DebtType.ACCOUNT_LIMIT) {
          // For account limits, pre-fill with current balance (limit - debt)
          const currentBalance = (source.accountLimit as number) - source.currentAmount;
          debtsMap[source._id!] = {payment: currentBalance.toFixed(2)};
        } else {
          debtsMap[source._id!] = {payment: Math.min(source.minMonthlyPayment, source.currentAmount).toFixed(2)};
        }
      });
      setDebts(debtsMap);
      setMonth(getCurrentMonth());
      setAssets('');
    }
  }, [editingId, open, calculatedRecords, calculatedDebts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate payments
      const EPSILON = 0.01; // Small tolerance for floating-point comparison
      for (const [debtSourceId, values] of Object.entries(debts)) {
        const debtSource = calculatedDebts.find(ds => ds._id === debtSourceId);
        if (!debtSource) continue;

        const paymentValue = parseFloat(values.payment);

        // For regular debts (not CREDIT_CARD or ACCOUNT_LIMIT)
        if (debtSource.type !== DebtType.CREDIT_CARD && debtSource.type !== DebtType.ACCOUNT_LIMIT) {
          const minRequired = Math.min(debtSource.minMonthlyPayment, debtSource.currentAmount);
          if (paymentValue < minRequired - EPSILON) {
            alert(`Payment for ${debtSource.name} must be at least ${formatCurrency(minRequired)}`);
            setLoading(false);
            return;
          }
          if (paymentValue > debtSource.currentAmount + EPSILON) {
            alert(`Payment for ${debtSource.name} cannot exceed remaining debt of ${formatCurrency(debtSource.currentAmount)}`);
            setLoading(false);
            return;
          }
        }
      }

      const debtsArray = Object.entries(debts)
        .map(([debtSourceId, values]) => {
          const debtSource = calculatedDebts.find(ds => ds._id === debtSourceId);

          if (debtSource?.type === DebtType.CREDIT_CARD) {
            // For credit cards: user enters current debt, payment = previous debt - current debt
            return {
              debtSourceId,
              payment: debtSource.currentAmount - parseFloat(values.payment)
            }
          }

          if (debtSource?.type === DebtType.ACCOUNT_LIMIT) {
            // For account limits: user enters current balance
            // New debt = accountLimit - currentBalance
            // Payment = previous debt - new debt
            const currentBalance = parseFloat(values.payment);
            const accountLimit = debtSource.accountLimit as number;
            const newDebt = accountLimit - currentBalance;
            const payment = debtSource.currentAmount - newDebt;

            return {
              debtSourceId,
              payment
            }
          }

          return {
            debtSourceId,
            payment: parseFloat(values.payment)
          }
        });

      const data = {
        month,
        assets: parseFloat(assets),
        debts: debtsArray
      };

      if (editingId) {
        await updateRecord(editingId, data);
      } else {
        await createRecord(data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving snapshot:', error);
      alert(error instanceof Error ? error.message : 'Failed to save snapshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateDebt = (debtSourceId: string, value: string) => {
    setDebts(prev => ({
      ...prev,
      [debtSourceId]: {
        ...prev[debtSourceId],
        payment: value
      }
    }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingId ? 'Edit Monthly Snapshot' : 'Add Monthly Snapshot'}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? 'Update your financial snapshot for this month'
              : 'Record your current financial position for this month'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Month */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-foreground">Month *</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Select the month for this snapshot
            </p>
          </div>

          {/* Assets */}
          <div className="space-y-2">
            <Label htmlFor="assets" className="text-foreground">Total Assets *</Label>
            <Input
              id="assets"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
              required
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Total value of all your assets (savings, investments, etc.)
            </p>
          </div>

          {/* Debts Section */}
          <div className="space-y-4">
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Debt Balances</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the current balance for each debt source
              </p>
            </div>
            {calculatedDebts.map((source) => {
                // Get the previous amount for this debt source from the editing record
                const previousAmount = editingRecord
                  ? editingRecord.debts.find(d => d.debtSourceId === source._id)?.previousAmount ?? source.currentAmount
                  : source.currentAmount;

                return (
                  <Card
                    key={source._id}
                    className="bg-slate-950/40 border-border backdrop-blur"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <CardTitle className="text-xl">{source.name}</CardTitle>
                            <Badge variant="outline" className={getDebtTypeColor(source.type)}>
                              {getDebtTypeLabel(source.type)}
                            </Badge>
                            {source.canOverpay && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Can Overpay
                              </Badge>
                            )}
                          </div>
                          {source.notes && (
                            <CardDescription className="mt-2">{source.notes}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Payment */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`debt-${source._id}-amount`}
                          className="text-sm text-foreground"
                        >
                          Previous debt
                        </Label>
                        <span
                          id={`debt-${source._id}-amount`}
                          className="bg-background border-border"
                        >{previousAmount.toFixed(2) + ' zł'}</span>
                      </div>
                      {source.type !== DebtType.CREDIT_CARD && source.type !== DebtType.ACCOUNT_LIMIT &&
												<div className="space-y-2">
													<Label
														htmlFor={`debt-${source._id}-payment`}
														className="text-sm text-foreground"
													>
														Payment Made
													</Label>
													<Input
														id={`debt-${source._id}-payment`}
														type="number"
														step="0.01"
														placeholder="0.00"
														max={previousAmount}
														value={debts[source._id!]?.payment || ''}
														onChange={(e) => updateDebt(source._id!, e.target.value)}
														className="bg-background border-border"
													/>
                          {previousAmount <= source.minMonthlyPayment ? (
                            <p className="text-xs text-amber-500">
                              Final payment: {formatCurrency(previousAmount)} (pay off remaining debt)
                            </p>
                          ) : source.minMonthlyPayment > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Min: {formatCurrency(source.minMonthlyPayment)} (or pay full amount)
                            </p>
                          ) : null}
												</div>}

                      {source.type === DebtType.CREDIT_CARD && (
                        <div className="space-y-2">
                          <Label
                            htmlFor={`debt-${source._id}-payment`}
                            className="text-sm text-foreground"
                          >
                            Current Debt
                          </Label>
                          <Input
                            id={`debt-${source._id}-payment`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            min={0}
                            max={previousAmount}
                            value={debts[source._id!]?.payment || ''}
                            onChange={(e) => updateDebt(source._id!, e.target.value)}
                            className="bg-background border-border"
                          />
                          {previousAmount < source.minMonthlyPayment && previousAmount > 0 ? (
                            <p className="text-xs text-amber-500">
                              Remaining debt is less than minimum payment - pay off completely
                            </p>
                          ) : source.minMonthlyPayment > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Min payment: {formatCurrency(source.minMonthlyPayment)}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {source.type === DebtType.ACCOUNT_LIMIT && (
                        <div className="space-y-2">
                          <Label
                            htmlFor={`debt-${source._id}-payment`}
                            className="text-sm text-foreground"
                          >
                            Current Balance
                          </Label>
                          <Input
                            id={`debt-${source._id}-payment`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            min={0}
                            value={debts[source._id!]?.payment || ''}
                            onChange={(e) => updateDebt(source._id!, e.target.value)}
                            className="bg-background border-border"
                          />
                          {source.minMonthlyPayment > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Min: {formatCurrency(source.minMonthlyPayment)}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              }
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Snapshot' : 'Add Snapshot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}